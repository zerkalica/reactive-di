/* @flow */

export type Cursor<V> = {
    get(): V;
    set(value: V): boolean;
}

export type CursorCreator<V: Object> = (path: Array<string>) => Cursor<V>;

export type FromJS<T: Object> = (data: Object) => T;

export type SimpleMap<K, V> = {[id: K]: V};
