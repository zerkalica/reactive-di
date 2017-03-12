// @flow

import type {IShape, IEntity} from '../interfaces'
import type {IGetable, ICacheable} from '../utils/resolveArgs'
import type {IHasDispose, IDisposable} from '../utils/DisposableCollection'

export type IHasDisplayName = {
    displayName: string;
}
export type IHasForceUpdate = IHasDisplayName & {
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
    merge?: (next: IShape<V>, prev: V) => ?V;
    init?: (args: any[]) => void;
    pull?: (v: V) => void;
    detach?: (v: V) => void;
    put?: (next: V) => void;
}

export interface IHook<P: Object> extends IEntity, IPullable, IHasDispose, ICacheable<IBaseHook<P>> {
    t: 4;
    hooks: IHook<*>[];
    willMount(): void;
    detach(): void;
    merge(target: any, oldValue: P): ?P;
}

export type INotifierItem = IPullable & ICacheable<*> & IDisposable

export interface INotifier {
    logger: ?IGetable<ILogger>;
    opId: number;
    trace: string;
    hook: ?INotifierItem;
    flush(): void;
    onError(e: Error, name: string, isHandled: boolean): void;
    notify<V>(c: INotifierItem[], name: string, oldValue: V, newValue: V): void;
}
