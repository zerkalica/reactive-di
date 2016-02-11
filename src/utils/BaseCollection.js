/* @flow */
import merge from './merge'

type MapFn<T, V> = (v: T, index?: number) => V;
type FilterFn<T> = (v: T, index?: number) => boolean;
type SortFn<T> = (a: T, b: T) => number;
type FindFn<T> = (element: T, index?: number, arr?: Array<T>, thisArg?: Object) => boolean;

export type Id = string;
export type CollectionItem = {
    id: Id;
}
type DeletedItems<T> = {[id: Id]: [T, number]};
type CollectionRec<T> = {
    items?: Array<T>;
    deleted?: DeletedItems<T>;
}
type UpdateFn<V> = (oldItem: V) => V;

type ItemRec = {};

export type Collection<Item: CollectionItem> = {
    length: number;
    createItem(rec: ItemRec): Item;
    fromArray(items: Array<ItemRec>): Collection<Item>;
    add(item: Item): Collection<Item>;
    remove(id: Id): Collection<Item>;
    softRemove(id: Id): Collection<Item>;
    restore(id: Id): Collection<Item>;
    get(id: Id): Item;
    set(id: Id, item: Item): Collection<Item>;
    update(id: Id, updateFn: UpdateFn<Item>): Collection<Item>;
    find(findFn: FindFn<Item>): Item;
    map<V>(mapFn: MapFn<Item, V>): Array<V>; // eslint-disable-line
    filter(filterFn: FilterFn<Item>): Collection<Item>;
    sort(sortFn: SortFn<Item>): Collection<Item>;
    toJS(): Array<Item>;
    toJSON(): string;
}

type ItemsMap<Item> = {
    [id: Id]: Item;
}

// implements Collection<Item>
export default class BaseCollection<Item: CollectionItem> {
    items: Array<Item>;
    deleted: DeletedItems<Item>;
    length: number;

    createItem: (rec: ItemRec) => Item;

    constructor(rec?: CollectionRec<Item>|Array<ItemRec> = []) {
        if (Array.isArray(rec)) {
            this.items = this._recsToItems(rec)
            this.deleted = {}
        } else {
            this.items = rec.items || []
            this.deleted = rec.deleted || {}
        }
        this.length = this.items.length
    }

    _copy(rec: CollectionRec<Item>): Collection<Item> {
        return merge(this, rec)
    }

    _getDeleted(id: Id): {
        items: Array<Item>,
        deleted: DeletedItems<Item>
    } {
        const oldItems = this.items
        const items: Array<Item> = [];
        const deleted: DeletedItems<Item> = {};
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

    _recsToItems(recs: Array<ItemRec>): Array<Item> {
        const items: Array<Item> = [];
        const itemsMap: ItemsMap<Item> = {};
        for (let i = 0, l = recs.length; i < l; i++) {
            const item: Item = this.createItem(recs[i]);
            itemsMap[item.id] = item
            items.push(item)
        }

        return items
    }

    toJS(): Array<Item> {
        return this.items
    }

    toJSON(): string {
        return JSON.stringify(this.toJS())
    }

    fromArray(recs: Array<ItemRec>): Collection<Item> {
        return this._copy({
            items: this._recsToItems(recs),
            deleted: {}
        })
    }

    add(item: Item): Collection<Item> {
        return this._copy({
            items: this.items.concat([item])
        })
    }

    remove(id: Id): Collection<Item> {
        return this._copy({
            items: this._getDeleted(id).items
        })
    }

    softRemove(id: Id): Collection<Item> {
        return this._copy({
            ...this._getDeleted(id)
        })
    }

    restore(id: Id): Collection<Item> {
        if (!this.deleted[id]) {
            throw new Error('Can\'t restore: element doesn\'t exists in collection: ' + id)
        }
        const [item, index] = this.deleted[id]
        delete this.deleted[id]
        const items = [].concat(this.items)
        items.splice(index, 0, item)
        return this._copy({items})
    }

    get(id: Id): Item {
        const {items} = this
        for (let i = 0, l = items.length; i < l; i++) {
            if (items[i].id === id) {
                return items[i]
            }
        }
        throw new Error('Can\'t get: element doesn\'t exists in collection: ' + id)
    }

    update(id: Id, updateFn: UpdateFn<Item>): Collection<Item> {
        const oldItems: Array<Item> = this.items;
        const items: Array<Item> = [];
        let isFound: boolean = false;
        let isChanged: boolean = false;
        for (let i = 0, l = oldItems.length; i < l; i++) {
            const item = oldItems[i]
            if (item.id !== id) {
                items.push(item)
            } else {
                isFound = true
                const newItem: Item = updateFn(item);
                if (item !== newItem) {
                    isChanged = true
                }
                items.push(newItem)
            }
        }
        if (!isFound) {
            throw new Error('Can\'t update: element doesn\'t exists in collection: ' + id)
        }

        return isChanged ? this._copy({items}) : this
    }

    set(id: Id, newItem: Item): Collection<Item> {
        return this.update(id, () => newItem)
    }

    find(findFn: FindFn<Item>): Item {
        return this.items.find(findFn)
    }

    map<V>(mapFn: MapFn<Item, V>): Array<V> {
        return this.items.map(mapFn)
    }

    filter(filterFn: FilterFn<Item>): Collection<Item> {
        const items = this.items.filter(filterFn)

        return items.length !== this.length
            ? this._copy({items})
            : this
    }

    sort(sortFn: SortFn<Item>): Collection<Item> {
        const oldItems = this.items
        const items = oldItems.sort(sortFn)

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

(BaseCollection.prototype: Object)[Symbol.iterator] = function iterator() {
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
