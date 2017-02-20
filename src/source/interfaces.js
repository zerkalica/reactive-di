// @flow

import type {IEntity} from '../interfaces'
import type {IGetable, ICacheable} from '../utils/resolveArgs'
import type {IDisposable, IDisposableCollection} from '../utils/DisposableCollection'
import type {INotifierItem} from '../hook/interfaces'

export type SourceStatusOpts<V: Object> = {
    complete?: boolean;
    pending?: boolean;
    error?: ?Error;
    promise?: ?Promise<V>;
}

export interface ISourceStatus<V: Object> {
    complete: boolean;
    pending: boolean;
    error: ?Error;
    promise: Promise<V>;
    isEqual(src: ISourceStatus<*>): boolean;
    copy(opts: SourceStatusOpts<V>): ISourceStatus<V>;
    _resolve: (v: V) => void;
    _reject: (e: Error) => void;
}

export type ISettable<V: Object> = {
    set(v: V): void;
}

export type ISetter<V: Object> = {
    [id: $Keys<V>]: (v: mixed) => void;
}

export interface IControllable {
    run(): void;
    abort(): void;
}

type IUpdaterBase<V> = {
    next?: (v: V) => void;
    complete?: (v: ?V) => void;
    error?: (e: Error) => void;
}

export type IUpdater<V> = IUpdaterBase<V> & {
    promise: () => Promise<V>;
} | IUpdaterBase<V> & {
    promise: void;
    observable: () => Observable<V, Error>;
}

export interface ISource<V: Object> extends IEntity, IGetable<V>, ISettable<V> {
    t: 1;
    status: ?ISource<ISourceStatus<V>>;
    getStatus(): ISource<ISourceStatus<V>>;

    computeds: IDisposableCollection<ICacheable<any> & IDisposable>;
    consumers: IDisposableCollection<INotifierItem>;
    setter(): ISetter<V>;
    eventSetter(): ISetter<V>;
    reset(): void;
    merge(v?: {[id: $Keys<V>]: mixed}): void;
    update(updaterPayload: IUpdater<V>): () => void;
}

export interface IStatus<V: Object> extends IEntity, IGetable<ISourceStatus<V>>, IDisposable {
    t: 3;
    sources: ISource<ISourceStatus<V>>[];
}
