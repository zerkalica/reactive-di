/* @flow */
import EntityMeta, {copyProps} from './EntityMeta'

type MapFn<T, V> = (v: T, index?: number) => V;
type FilterFn<T> = (v: T, index?: number) => boolean;
type SortFn<T> = (a: T, b: T) => number;
type FindFn<T> = (element: T, index?: number, arr?: Array<T>, thisArg?: Object) => boolean;
type SetFn<T> = (element: T) => T;

export type CollectionRec<T: Entity> = {
    items?: Array<T>;
    $meta?: EntityMeta;
}

/* eslint-disable no-unused-vars */
type Entity = {
    id?: ?string;
    $meta: {
        deleted?: ?boolean;
    };
};
/* eslint-enable no-unused-vars */

export default class Collection<T: Entity> {
    items: Array<T>;
    $meta: EntityMeta;

    constructor<R>(rec: CollectionRec<T>|Array<R> = []) {
        if (Array.isArray(rec)) {
            this.items = rec.map(el => this.createItem(el))
            this.$meta = new EntityMeta()
        } else {
            this.items = rec.items || []
            this.$meta = rec.$meta || new EntityMeta()
        }
    }

    /* eslint-disable no-unused-vars */
    createItem<R>(rec: R): T|any {
    }
    /* eslint-enable no-unused-vars */

    copy(rec: CollectionRec<T>): Collection<T> {
        return new this.constructor(copyProps(this, rec))
    }

    _copyItems(items: Array<T>): Collection<T> {
        return this.copy({items})
    }

    find(findFn: FindFn<T>): T {
        return this.items.find(findFn)
    }

    add(element: T): Collection<T> {
        return this._copyItems(this.items.concat([element]))
    }

    remove(id: ?string): Collection<T> {
        return this.filter(el => el.id !== id)
    }

    set(id: ?string, setFn: SetFn<T>): Collection<T> {
        return this._copyItems(this.items.map(el => el.id === id ? setFn(el) : el))
    }

    get(id: string): T {
        return this.find(el => el.id === id)
    }

    map<V>(mapFn: MapFn<T, V>): Array<V> {
        const result: Array<V> = [];
        const items = this.items
        for (let i = 0, l = items.length; i < l; i++) {
            const item = items[i]
            if (!item.$meta.deleted) {
                result.push(mapFn(item, i))
            }
        }

        return result
    }

    filter(filterFn: FilterFn<T>): Collection<T> {
        return this._copyItems(this.items.filter(filterFn))
    }

    slice(offset: number, length?: number): Collection<T> {
        return this._copyItems(this.items.slice(offset, length))
    }

    sort(sortFn: SortFn<T>): Collection<T> {
        return this._copyItems(this.items.sort(sortFn))
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
                this._pos++
                rec = {value: this.items[this._pos], done: false}
            } else {
                rec = {done: true}
            }
            return rec
        },
        items: this.items,
        _pos: 0
    }
}
