/* @flow */
import EntityMeta, {copyProps} from './EntityMeta'

type MapFn<T, V> = (v: T, index?: number) => V;
type FilterFn<T> = (v: T, index?: number) => boolean;
type SortFn<T> = (a: T, b: T) => number;
type FindFn<T> = (element: T, index?: number, arr?: Array<T>, thisArg?: Object) => boolean;
type SetFn<T> = (element: T) => T;

type DeletedItems<T> = {[id: string]: [T, number]};

type CollectionRec<T: Entity> = {
    items?: Array<T>;
    $meta?: EntityMeta;
    deleted?: DeletedItems<T>;
}

/* eslint-disable no-unused-vars */
type Entity = {
    id?: ?string;
};
/* eslint-enable no-unused-vars */

export default class Collection<T: Entity> {
    items: Array<T>;
    $meta: EntityMeta;
    deleted: DeletedItems<T>;
    length: number;

    constructor<R: Object>(rec: CollectionRec<T>|Array<R> = []) {
        if (Array.isArray(rec)) {
            this.items = rec.map(el => this.createItem(el))
            this.$meta = new EntityMeta()
            this.deleted = {}
        } else {
            this.items = rec.items || []
            this.$meta = rec.$meta || new EntityMeta()
            this.deleted = rec.deleted || {}
        }
        this.length = this.items.length
    }

    /* eslint-disable no-unused-vars */
    createItem<R: Object>(rec: R): T|any {
        // Implement
    }
    /* eslint-enable no-unused-vars */

    _copy(rec: CollectionRec<T>): Collection<T> {
        return new this.constructor(copyProps(this, rec))
    }

    add(element: T): Collection<T> {
        return this._copy({items: this.items.concat([element])})
    }

    _getDeleted(id: string): {
        items: Array<T>,
        deleted: DeletedItems<T>
    } {
        const oldItems = this.items
        const items: Array<T> = [];
        const deleted: DeletedItems<T> = {};
        for (let i = 0, l = oldItems.length; i < l; i++) {
            const item = oldItems[i]
            if (item.id !== id) {
                items.push(item)
            } else {
                deleted[id] = [item, i]
            }
        }

        return {items, deleted}
    }

    remove(id: string): Collection<T> {
        const {items} = this._getDeleted(id)
        return this._copy({items})
    }

    softRemove(id: string): Collection<T> {
        return this._copy({...this._getDeleted(id)})
    }

    softRestore(id: string): Collection<T> {
        if (!this.deleted[id]) {
            throw new Error('Element not exists in collection: ' + id)
        }
        const [item, index] = this.deleted[id]
        delete this.deleted[id]
        const items = [].concat(this.items)
        items.splice(index, 0, item)
        return this._copy({items})
    }

    set(id: string, setFn: SetFn<T>): Collection<T> {
        const oldItems = this.items
        const items: Array<T> = [];
        let isFound: boolean = false;
        for (let i = 0, l = oldItems.length; i < l; i++) {
            const item = oldItems[i]
            if (item.id !== id) {
                items.push(item)
            } else {
                isFound = true
                items.push(setFn(item))
            }
        }
        if (!isFound) {
            throw new Error('Element not exists in collection: ' + id)
        }

        return this._copy({items})
    }

    find(findFn: FindFn<T>): T {
        return this.items.find(findFn)
    }

    get(id: string): T {
        const item = this.find(el => el.id === id)
        if (!item) {
            throw new Error('Element not exists in collection: ' + id)
        }
        return item
    }

    map<V>(mapFn: MapFn<T, V>): Array<V> {
        return this.items.map(mapFn)
    }

    filter(filterFn: FilterFn<T>): Collection<T> {
        return this._copy({items: this.items.filter(filterFn)})
    }

    sort(sortFn: SortFn<T>): Collection<T> {
        return this._copy({items: this.items.sort(sortFn)})
    }
}


const obj: {
    [id: any]: Function
} = Collection.prototype;

obj[Symbol.iterator] = function iterator() {
    return {
        next() {
            let rec
            if (this._pos < this.items.length) {
                rec = {value: this.items[this._pos], done: false}
                this._pos++
            } else {
                rec = {done: true}
            }
            return rec
        },
        items: this.items,
        _pos: 0
    }
}
