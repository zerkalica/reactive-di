/* @flow */

import IdIndexer from './IdIndexer'
import {setterKey} from '../atoms/interfaces'

export type MapFn<T, V> = (v: T, index?: number) => V
export type FilterFn<T> = (v: T, index?: number) => boolean
export type SortFn<T> = (a: T, b: T) => number
export type FindFn<T> = (element: T, index?: number, arr?: T[], thisArg?: Object) => boolean
export type UpdateFn<V> = (oldItem: V) => V
export type SelectorFn<V> = (item: V) => boolean

export const itemKey = Symbol('coll:key')

export type ListenerFn<Item> = (newItem: Item, oldItem: Item, index: number) => void

export type ItemListener<Item> = {
    update(newItem: Item, oldItem: Item, index: number): void;
}

export const fakeListener: ItemListener<*> = {
    update() {}
}

export interface IIndexer<V> {
    removeAll(): void;
    add(item: V, index: number): void;
    remove(item: V, index: number): void;
    update(newItem: V, oldItem: ?V, index: number): void;
}

export default class IndexCollection<Item: Object, Indexer: IIndexer<Item>> {
    // @@iterator(): Iterator<Item>;
    _items: Item[]
    length: number
    indexer: Indexer

    static Item: Class<Item>
    static Indexer: ?Class<Indexer>

    constructor(recs?: ?$Shape<Item>[], newItems?: ?Item[], indexer?: ?Indexer) {
        this._items = (recs ? this._recsToItems(recs) : newItems) || []
        this.length = this._items.length
        const Idxr = this.constructor.Indexer
        this.indexer = indexer || (Idxr ? new Idxr() : new (IdIndexer: any)())
    }

    copy(items: $Shape<Item>[]): this {
        return new this.constructor(items, null, this.indexer)
    }

    _copy(items: Item[]): this {
        const newObj = new this.constructor(null, items, this.indexer)
        const source = (newObj: any)[setterKey] = (this: any)[setterKey]

        source.set(newObj)
        return newObj
    }

    _recsToItems(recs: $Shape<Item>[]): Item[] {
        const protoItem = new this.constructor.Item()
        const items: Item[] = new Array(recs.length)
        for (let i = 0, l = recs.length; i < l; i++) {
            const newItem = protoItem.copy(recs[i])
            ;(newItem: Object)[itemKey] = {listener: fakeListener, i}
            items[i] = newItem
        }

        return items
    }

    toJS(): Item[] {
        return this._items
    }

    toJSON(): string {
        return JSON.stringify(this.toJS())
    }

    removeAll(): this {
        if (this.indexer) {
            this.indexer.removeAll()
        }
        return this._copy([])
    }

    get(index: number): ?Item {
        return this._items[index]
    }

    remove(ptr: Item, count?: number): this {
        const index: number = ptr[itemKey].i
        const cnt = count || 1
        const items = this._items

        items.splice(index, cnt)

        if (this.indexer) {
            const indexer = this.indexer
            for (let i = index, l = index + cnt; i < l; i++) {
                indexer.remove(items[i], i)
            }
        }
        for (let i = index, l = items.length; i < l; i++) {
            const item = items[i]
            item[itemKey].i -= cnt
        }
        return this._copy(this._items)
    }

    insertMultiple(ptr: Item, newItems: Item[]): this {
        const index: number = ptr[itemKey].i
        this._items.splice(index, 0, ...newItems)
        const items = this._items
        let cnt: number = index
        const indexer = this.indexer
        const nl = indexer ? index + newItems.length : 0
        for (let i = index, l = items.length; i < l; i++) {
            const item = items[i]
            item[itemKey].i = cnt++
            if (i < nl) {
                (indexer: any).add(item, index)
            }
        }
        return this._copy(this._items)
    }

    insert(ptr: Item, newItem: Item): this {
        return this.insertMultiple(ptr, [newItem])
    }

    set(ptr: Item, newItem: Item): this {
        const index: number = ptr[itemKey].i
        const item = this._items[index]
        if (item !== newItem) {
            if (this.indexer) {
                this.indexer.update(newItem, item, index)
            }
            this._items[index] = newItem
            const updater = (newItem: Object)[itemKey] = (item: Object)[itemKey] // eslint-disable-line
            updater.listener.update(newItem, item, index)
        }
        return this
    }

    update(ptr: Item, updateFn?: UpdateFn<Item>): this {
        const index: number = ptr[itemKey].i
        const oldItem = this._items[index]
        let newItem: Item
        if (updateFn) {
            newItem = updateFn(oldItem)
        } else {
            if (typeof ptr !== 'object') {
                throw new Error('Need an Item object as first argument')
            }
            newItem = ptr
        }
        if (oldItem !== newItem || !updateFn) {
            if (this.indexer) {
                this.indexer.update(newItem, oldItem, index)
            }
            this._items[index] = newItem
            const updater = (newItem: Object)[itemKey] = (oldItem: Object)[itemKey]
            updater.listener.update(newItem, oldItem, index)
        }
        return this
    }

    updateAll(updateFn: UpdateFn<Item>): this {
        const items: Item[] = this._items
        const indexer = this.indexer
        for (let i = 0, l = items.length; i < l; i++) {
            const item = items[i]
            const newItem: Item = updateFn(item)
            if (item !== newItem) {
                if (indexer) {
                    indexer.update(newItem, item, i)
                }
                const updater = (newItem: Object)[itemKey] = (item: Object)[itemKey]
                updater.listener.update(newItem, item, i)
            }
            items[i] = newItem
        }

        return this
    }

    updateByFn(selFn: SelectorFn<Item>, updateFn: UpdateFn<Item>): this {
        const items: Item[] = this._items
        const indexer = this.indexer
        for (let i = 0, l = items.length; i < l; i++) {
            const item = items[i]
            if (selFn(item)) {
                const newItem = updateFn(item)
                if (item !== newItem) {
                    if (indexer) {
                        indexer.update(newItem, item, i)
                    }
                    const updater = (newItem: Object)[itemKey] = (item: Object)[itemKey]
                    updater.listener.update(newItem, item, i)
                }
                items[i] = newItem
            }
        }

        return this
    }

    push(item: Item): this {
        const i = this._items.length
        ;(item: Object)[itemKey] = { // eslint-disable-line
            listener: fakeListener,
            i
        }
        if (this.indexer) {
            this.indexer.add(item, i)
        }

        this._items.push(item)
        return this._copy(this._items)
    }

    pop(): this {
        const item = this._items.pop()
        if (this.indexer) {
            this.indexer.remove(item, this._items.length)
        }
        return this._copy(this._items)
    }

    find(findFn: FindFn<Item>): ?Item {
        return this._items.find(findFn)
    }

    map<V>(mapFn: MapFn<Item, V>): V[] {
        return this._items.map(mapFn)
    }

    filter(filterFn: FilterFn<Item>): Item[] {
        return this._items.filter(filterFn)
    }

    sort(sortFn: SortFn<Item>): Item[] {
        return this._items.sort(sortFn)
    }
}

const doneTrue = {done: true}

class IndexCollectionIterator<I> {
    _items: I[]
    _l: number
    _max: number
    _doneFalse: {
        value: I;
        done: false;
    }

    constructor(items: I[]) {
        this._items = items
        this._max = items.length
        this._l = 0
        this._doneFalse = {
            value: (null: any),
            done: false
        }
    }

    next(): {value: I, done: false} | {done: true} {
        if (this._l < this._max) {
            this._doneFalse.value = this._items[this._l++]
            return this._doneFalse
        }

        return doneTrue
    }
}

(IndexCollection.prototype: Object)[Symbol.iterator] = function iterator() {
    return new IndexCollectionIterator(this._items)
}
