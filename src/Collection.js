/* @flow */
import EntityMeta from './EntityMeta'
import type {Entity, EntityMetaRec} from './EntityMeta'

type MapFn<T> = (v: T, index?: number) => T;
type FilterFn<T> = (v: T, index?: number) => boolean;
type SortFn<T> = (a: T, b: T) => number;
type FindFn<T> = (element: T, index?: number, arr?: Array<T>, thisArg?: Object) => boolean;
type SetFn<T> = (element: T) => T;

export type CollectionRec<T: Entity> = {
    items?: Array<T>;
    $meta?: EntityMetaRec;
}

export default class Collection<T: Entity> {
    items: Array<T>;
    $meta: EntityMeta;

    constructor(items?: ?Array<T>) {
        this.items = items || []
        this.$meta = EntityMeta.fromArray(this.items)
    }

    copy(rec: CollectionRec<T>): Collection<T> {
        const obj = this._create(rec.items || [])
        if (rec.$meta) {
            obj.$meta = new EntityMeta(rec.$meta)
        }
        return obj
    }

    _create(items: Array<T>): Collection<T> {
        this.$meta.notify && this.$meta.notify()
        return new this.constructor(items)
    }

    toArray(): Array<T> {
        return this.items.filter(item => item.$meta.deleted !== true)
    }

    find(findFn: FindFn<T>): T {
        return this.items.find(findFn)
    }

    add(element: T): Collection<T> {
        return this._create(this.items.concat([element]))
    }

    remove(id: ?string): Collection<T> {
            return this.filter(el => el.id !== id)
    }

    set(id: ?string, setFn: SetFn<T>): Collection<T> {
        return this.map(el => el.id === id ? setFn(el) : el)
    }

    get(id: string): T {
        return this.find(el => el.id === id)
    }

    map(mapFn: MapFn<T>): Collection<T> {
        return this._create(this.items.map(mapFn))
    }

    filter(filterFn: FilterFn<T>): Collection<T> {
        return this._create(this.items.filter(filterFn))
    }

    slice(offset: number, length?: number): Collection<T> {
        return this._create(this.items.slice(offset, length))
    }

    sort(sortFn: SortFn<T>): Collection<T> {
        return this._create(this.items.sort(sortFn))
    }
}

const obj: {
    [id: any]: Function
} = Collection.prototype;

obj[Symbol.iterator] = function iterator() {
    return {
        next() {
            if (this._pos < this.items.length) {
                this._pos++
                return {value: this.items[this._pos], done: false}
            } else {
                return {done: true}
            }
        },
        items: this.items,
        _pos: 0
    }
}
