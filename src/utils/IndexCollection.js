/* @flow */

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

export interface ICollectionLogger {
    removeAll(): void;
    add<V>(item: V, index: number): void;
    remove<V>(item: V, index: number): void;
    update<V>(newItem: V, oldItem: ?V, index: number): void;
}

export default class IndexCollection<Item: Object> {
    // @@iterator(): Iterator<Item>;
    _items: Item[]
    length: number
    _logger: ?ICollectionLogger
    static Item: Class<Item>

    constructor(recs?: ?$Shape<Item>[], newItems?: ?Item[], logger?: ?ICollectionLogger) {
        this._items = (recs ? this._recsToItems(recs) : newItems) || []
        this.length = this._items.length
        this._logger = logger
    }

    copy(items: Item[]): this {
        return new this.constructor(null, items, this._logger)
    }

    _recsToItems(recs: $Shape<Item>[]): Item[] {
        const ItemClass = this.constructor.Item
        const items: Item[] = new Array(recs.length)
        for (let i = 0, l = recs.length; i < l; i++) {
            const newItem = new ItemClass(recs[i])
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
        if (this._logger) {
            this._logger.removeAll()
        }
        return this.copy([])
    }

    get(index: number): ?Item {
        return this._items[index]
    }

    remove(ptr: number | Item, count?: number): this {
        const index: number = typeof ptr === 'object' ? ptr[itemKey].i : ptr
        const cnt = count || 1
        const items = this._items

        items.splice(index, cnt)

        if (this._logger) {
            const logger = this._logger
            for (let i = index, l = index + cnt; i < l; i++) {
                logger.remove(items[i], i)
            }
        }
        for (let i = index, l = items.length; i < l; i++) {
            const item = items[i]
            item[itemKey].i -= cnt
        }
        return this.copy(this._items)
    }

    insertMultiple(ptr: number | Item, newItems: Item[]): this {
        const index: number = typeof ptr === 'object' ? ptr[itemKey].i : ptr
        this._items.splice(index, 0, ...newItems)
        const items = this._items
        let cnt: number = index
        const logger = this._logger
        const nl = logger ? index + newItems.length : 0
        for (let i = index, l = items.length; i < l; i++) {
            const item = items[i]
            item[itemKey].i = cnt++
            if (i < nl) {
                (logger: any).add(item, index)
            }
        }
        return this.copy(this._items)
    }

    insert(ptr: number | Item, newItem: Item): this {
        return this.insertMultiple(ptr, [newItem])
    }

    set(ptr: number | Item, newItem: Item): this {
        const index: number = typeof ptr === 'object' ? ptr[itemKey].i : ptr
        const item = this._items[index]
        if (item !== newItem) {
            if (this._logger) {
                this._logger.update(newItem, item, index)
            }
            this._items[index] = newItem
            const updater = (newItem: Object)[itemKey] = (item: Object)[itemKey] // eslint-disable-line
            updater.listener.update(newItem, item, index)
        }
        return this
    }

    update(ptr: number | Item, updateFn: UpdateFn<Item>): this {
        const index: number = typeof ptr === 'object' ? ptr[itemKey].i : ptr
        const oldItem = this._items[index]
        const newItem = updateFn(oldItem)
        if (oldItem !== newItem) {
            if (this._logger) {
                this._logger.update(newItem, oldItem, index)
            }
            this._items[index] = newItem
            const updater = (newItem: Object)[itemKey] = (oldItem: Object)[itemKey]
            updater.listener.update(newItem, oldItem, index)
        }
        return this
    }

    updateAll(updateFn: UpdateFn<Item>): this {
        const items: Item[] = this._items
        const logger = this._logger
        for (let i = 0, l = items.length; i < l; i++) {
            const item = items[i]
            const newItem: Item = updateFn(item)
            if (item !== newItem) {
                if (logger) {
                    logger.update(newItem, item, i)
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
        const logger = this._logger
        for (let i = 0, l = items.length; i < l; i++) {
            const item = items[i]
            if (selFn(item)) {
                const newItem = updateFn(item)
                if (item !== newItem) {
                    if (logger) {
                        logger.update(newItem, item, i)
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
        if (this._logger) {
            this._logger.add(item, i)
        }

        this._items.push(item)
        return this.copy(this._items)
    }

    pop(): this {
        const item = this._items.pop()
        if (this._logger) {
            this._logger.remove(item, this._items.length)
        }
        return this.copy(this._items)
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
