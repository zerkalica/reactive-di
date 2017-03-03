// @flow

import type {IEntity} from '../interfaces'
import type {IGetable, ICacheable} from '../utils/resolveArgs'
import type {IHasDispose, IDisposable} from '../utils/DisposableCollection'

export type IHasForceUpdate = {
    forceUpdate(): void;
}

export type ICallerInfo<V> = {
    trace: string;
    opId: number;
    modelName: string;
    oldValue: ?V;
    newValue: V;
}

export interface ILogger {
    onRender(upd: IHasForceUpdate[]): void;
    onError(error: Error, name: string): void;
    onSetValue<V>(info: ICallerInfo<V>): void;
}

export type IPullable = {
    pull(): ?IHasForceUpdate;
}

export type IBaseHook<V: Object> = {
    shouldUpdate?: (next: V, prev: V) => boolean;
    selfUpdate?: (v: V) => void;
    willMount?: (v: V) => void;
    willUnmount?: (v: V) => void;
    willUpdate?: (next: V) => void;
}

export interface IHook<P: Object> extends IEntity, IPullable, IHasDispose, ICacheable<IBaseHook<P>> {
    t: 4;
    hooks: IHook<*>[];
    willMount(): void;
    willUnmount(): void;
    shouldUpdate(target: P, oldValue: P): boolean;
}

export type INotifierItem = IPullable & ICacheable<*> & IDisposable

export interface INotifier {
    logger: ?IGetable<ILogger>;
    opId: number;
    trace: string;
    flush(): void;
    onError(e: Error, name: string, isHandled: boolean): void;
    notify<V>(c: INotifierItem[], name: string, oldValue: V, newValue: V): void;
}
