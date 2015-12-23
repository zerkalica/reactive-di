/* @flow */
import merge from './merge'

type MapFn<T, V> = (v: T, index?: number) => V;
type FilterFn<T> = (v: T, index?: number) => boolean;
type SortFn<T> = (a: T, b: T) => number;
type FindFn<T> = (element: T, index?: number, arr?: Array<T>, thisArg?: Object) => boolean;
type SetFn<T> = (element: T) => T;

type DeletedItems<T, TId> = {[id: TId]: [T, number]};

type CollectionRec<T: Entity, TId> = {
    items?: Array<T>;
    deleted?: DeletedItems<T, TId>;
}

/* eslint-disable no-unused-vars */
type Entity<TId> = {
    id?: ?TId;
};
/* eslint-enable no-unused-vars */

export default class Collection<T: Entity, TId> {
    items: Array<T>;
    deleted: DeletedItems<T, TId>;
    length: number;

    constructor<R: Object>(rec: CollectionRec<T, TId>|Array<R> = []) {
        if (Array.isArray(rec)) {
            this.items = rec.map(el => this.createItem(el))
            this.deleted = {}
        } else {
            this.items = rec.items || []
            this.deleted = rec.deleted || {}
        }
        this.length = this.items.length
    }

    /* eslint-disable no-unused-vars */
    createItem<R: Object>(rec: R): T|any {
        // Implement
    }
    /* eslint-enable no-unused-vars */

    _copy(rec: CollectionRec<T, TId>): Collection<T, TId> {
        return merge(this, rec)
    }

    add(element: T): Collection<T, TId> {
        return this._copy({items: this.items.concat([element])})
    }

    _getDeleted(id: TId): {
        items: Array<T>,
        deleted: DeletedItems<T, TId>
    } {
        const oldItems = this.items
        const items: Array<T> = [];
        const deleted: DeletedItems<T, TId> = {};
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

    remove(id: TId): Collection<T, TId> {
        const {items} = this._getDeleted(id)
        return this._copy({items})
    }

    softRemove(id: TId): Collection<T, TId> {
        return this._copy({...this._getDeleted(id)})
    }

    softRestore(id: TId): Collection<T, TId> {
        if (!this.deleted[id]) {
            throw new Error('Element not exists in collection: ' + id)
        }
        const [item, index] = this.deleted[id]
        delete this.deleted[id]
        const items = [].concat(this.items)
        items.splice(index, 0, item)
        return this._copy({items})
    }

    set(id: TId, setFn: SetFn<T>): Collection<T, TId> {
        const oldItems = this.items
        const items: Array<T> = [];
        let isFound: boolean = false;
        let isChanged: boolean = false;
        for (let i = 0, l = oldItems.length; i < l; i++) {
            const item = oldItems[i]
            if (item.id !== id) {
                items.push(item)
            } else {
                isFound = true
                const newItem = setFn(item)
                if (item !== newItem) {
                    isChanged = true
                }
                items.push(newItem)
            }
        }
        if (!isFound) {
            throw new Error('Element not exists in collection: ' + id)
        }

        return isChanged ? this._copy({items}) : this
    }

    find(findFn: FindFn<T>): T {
        return this.items.find(findFn)
    }

    get(id: TId): T {
        const item = this.find(el => el.id === id)
        if (!item) {
            throw new Error('Element not exists in collection: ' + id)
        }
        return item
    }

    map<V>(mapFn: MapFn<T, V>): Array<V> {
        return this.items.map(mapFn)
    }

    filter(filterFn: FilterFn<T>): Collection<T, TId> {
        const items = this.items.filter(filterFn)
        return items.length !== this.length ? this._copy({items}) : this
    }

    sort(sortFn: SortFn<T>): Collection<T, TId> {
        const oldItems = this.items
        const items = this.items.sort(sortFn)

        let isChanged: boolean = false;
        for (let i = 0, l = items.length; i < l; i++) {
            if (items[i].id !== oldItems[i].id) {
                isChanged = true
                break
            }
        }

        return isChanged ? this._copy({items}) : this
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
