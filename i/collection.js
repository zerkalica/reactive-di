/* @flow */

export type MapFn<T, V> = (v: T, index?: number) => V;
export type FilterFn<T> = (v: T, index?: number) => boolean;
export type SortFn<T> = (a: T, b: T) => number;
export type FindFn<T> = (element: T, index?: number, arr?: Array<T>, thisArg?: Object) => boolean;
export type Id = string;
export type UpdateFn<V> = (oldItem: V) => V;
export type SelectorFn<V> = (item: V) => boolean;
export type ItemRec = {};

export interface CollectionItem {
    id: Id;
}

export interface Collection<Item: CollectionItem> {
    @@iterator(): Iterator<Item>;
    length: number;
    createItem(rec: ItemRec): Item;
    fromArray(items: Array<ItemRec>): Collection<Item>;
    add(item: Item): Collection<Item>;
    remove(id: Id): Collection<Item>;
    softRemove(id: Id): Collection<Item>;
    restore(id: Id): Collection<Item>;
    get(id: Id): Item;
    set(id: Id, item: Item): Collection<Item>;
    update(id: ?Id|SelectorFn<Item>, updateFn: UpdateFn<Item>): Collection<Item>;
    find(findFn: FindFn<Item>): Item;
    map<V>(mapFn: MapFn<Item, V>): Array<V>; // eslint-disable-line
    filter(filterFn: FilterFn<Item>): Collection<Item>;
    sort(sortFn: SortFn<Item>): Collection<Item>;
    toJS(): Array<Item>;
    toJSON(): string;
}
