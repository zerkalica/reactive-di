// @flow

export interface IAdapter<CustomRule> {
    create<V: Object>(css: V, key: string): ISheet<V> & CustomRule;
    sync(added: (ISheet<*> & CustomRule)[], removed: (ISheet<*> & CustomRule)[]): void;
}

export interface IRemover {
    remove<V>(sheet: ISheetMeta<V, *>): void;
}

export interface ISheet<V> {
    classes: {+[id: $Keys<V>]: string};
}

export interface ISheetMeta<V, CustomRule> {
    remover: IRemover;
    sheet: ISheet<V> & CustomRule;
    key: string;
}

export interface ISheetManager {
    sheet<V: Object>(key: string, css: V, memoized: boolean): V;
}
