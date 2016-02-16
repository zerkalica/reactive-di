/* @flow */
import {
    Id,
    ItemRec,
    UpdateFn,
    FindFn,
    MapFn,
    FilterFn,
    SortFn,
    Collection,
    CollectionItem
} from '!/collection'

declare class BaseCollection<Item: CollectionItem> {
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
    update(id: Id, updateFn: UpdateFn<Item>): Collection<Item>;
    find(findFn: FindFn<Item>): Item;
    map<V>(mapFn: MapFn<Item, V>): Array<V>; // eslint-disable-line
    filter(filterFn: FilterFn<Item>): Collection<Item>;
    sort(sortFn: SortFn<Item>): Collection<Item>;
    toJS(): Array<Item>;
    toJSON(): string;
}
