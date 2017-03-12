// @flow

import type {IEntity, IShape} from '../interfaces'
import type {IGetable, ICacheable} from '../utils/resolveArgs'
import type {IDisposable, IDisposableCollection} from '../utils/DisposableCollection'
import type {INotifier, INotifierItem} from '../hook/interfaces'

export type SourceStatusOpts = {
    complete?: boolean;
    pending?: boolean;
    error?: ?Error;
}

export interface ISourceStatus {
    complete: boolean;
    pending: boolean;
    error: ?Error;
    isEqual(src: ISourceStatus): boolean;
    copy(opts: SourceStatusOpts): ISourceStatus;
}

export type ISettable<V: Object> = {
    push(v: V): void;
}

export type ISetter<V: Object> = {
    [id: $Keys<V>]: (v: mixed) => void;
}

export type IUpdater<V> = {
    run: () => (Promise<V> | Observable<V, Error>);
    next?: (v: ?V) => void;
    complete?: (v: V) => void;
    error?: (e: Error) => void;
}

export interface IPromisable<V> {
    resolve(v: V): void;
    reject(e: Error): void;
    promise: Promise<V>;
}

export interface IControllable {
    constructor<V: Object>(
        updater: IUpdater<V>,
        source: ISource<V>,
        status: ISource<ISourceStatus>,
        promisable: IPromisable<V>,
        notifier: INotifier
    ): IControllable;
    run(): void;
    abort(): void;
}

export interface ISource<V: Object> extends IEntity, IGetable<V>, ISettable<V> {
    t: 1;
    status: ?ISource<ISourceStatus>;
    getStatus(): ISource<ISourceStatus>;

    computeds: IDisposableCollection<ICacheable<any> & IDisposable>;
    consumers: IDisposableCollection<INotifierItem>;
    setter(): ISetter<V>;
    eventSetter(): ISetter<V>;
    promise(): Promise<V>;
    reset(v?: IShape<V>): void;
    pend(): void;
    error(error: Error): void;
    merge(v: IShape<V>): void;
    push(v: V): void;
    update(updaterPayload: IUpdater<any>, throttleTime?: ?number): () => void;
}

export interface IStatus<V: Object> extends IEntity, IGetable<ISourceStatus>, IDisposable {
    t: 3;
    sources: ISource<ISourceStatus>[];
}
