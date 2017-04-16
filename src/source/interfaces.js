// @flow

import type {IContext} from '../commonInterfaces'

export type IAsyncValue<M> = Promise<M> | Observable<M, Error>

export interface IGetable<V: Object> {
    cached: ?V;
    get(): V;
}

export type IBaseHook<V: Object, M> = {
    merge?: (next: M, prev: ?V) => ?V;
    pull?: (v: V, prev: V, src: ISource<V, M>) => IAsyncValue<M> | void;
    put?: (v: V, prev: V, src: ISource<V, M>) => IAsyncValue<M> | void;
    reap?: (v: V, prev: V) => void;
}

export interface IUpdatePayload<V: Object, M> {
    run(): IAsyncValue<M>;
    +next?: (v: ?V) => void;
    +complete?: (v: any) => void;
    +error?: (e: Error) => void;
}

export type ISourceStatus = 'PENDING' | 'COMPLETE' | Error
export interface ISource<V, M> {
    id: number;
    displayName: string;
    cached: ?V;

    getStatus(): ISourceStatus;
    get(): V;
    set(v?: ?M): void;
    merge(rawNewVal?: ?M): void;
    reset(v?: ?M): void;
    pend(isPending: boolean): void;
    error(err: Error): void;

    then(cb: (v: V) => void): ISource<V, M>;
    catch(cb: (v: Error) => void): ISource<V, M>;
    reap(): void;

    update(payload: IUpdatePayload<V, M>): () => void;
}

export interface ISourceInt<V, M> extends ISource<V, M> {
    t: 0;
    masters: IMaster[];
    refs: number;
    closed: boolean;
    status: ?ISourceStatus;
    context: IContext;

    getStatus(): ISourceStatus;
    resolve(binder: IRelationBinder): void;
    resolveStack(binder: IRelationBinder): void;
}

export type IMaster = ISourceInt<*, *>

export interface IComputed<V: Object> {
    t: 0; // computed
    masters: IMaster[];
    displayName: string;

    closed: boolean;
    cached: ?V;

    refs: number;

    get(): V;
    resolve(binder: IRelationBinder): void;
    reap(): void;
}

export interface IComponentInfo<Props> {
    displayName: string;
    id: number;
    props: Props;
}

export interface IComponentUpdater<Props: Object = {}> extends IComponentInfo<Props> {
    parentId: number;
    forceUpdate(): void;
}

export type IRelationHook = ISourceInt<*, *> | IComputed<*>

export interface IConsumer {
    t: 1;
    closed: boolean;
    cached: ?any;
    displayName: string;
    master: IMaster[];
    hooks: IRelationHook[];

    actualize(updaters: IComponentUpdater<*>[]): void;
}

export type ISlave = IComputed<*> | IConsumer | ISourceInt<*, *>

export type IRelationItemValue = IComputed<*> | ISourceInt<*, *>

export interface IRelationItem {
    has: boolean[];
    v: IRelationItemValue;
    ender: boolean;
}

export interface IRelationBinder {
    level: number;
    stack: IRelationItem[];
    status: ?IComputed<any>;
    consumer: ?IConsumer;
    debugStr(sub: ?mixed): string;
    begin(item: IRelationItemValue, isEnder: boolean): void;
    end(): void;
}

export type ICallerInfo<V> = {
    trace: string;
    opId: number;
    modelName: string;
    oldValue: ?V;
    newValue: V;
}

export interface ILogger {
    onRender<Props: Object>(info: IComponentInfo<Props>): void;
    onError(error: Error, name: string): void;
    onSetValue<V>(info: ICallerInfo<V>): void;
}

export interface IHasForceUpdate {
    forceUpdate(): void;
}
export type ITraceId = string

export interface INotifier {
    _logger: ?IGetable<ILogger>;
    lastId: number;
    opId: number;
    parentId: number;

    consumers: IConsumer[];
    trace: string;
    changed<V>(name: string, newValue: V, oldValue: V): void;
    error(name: string, err: Error): void;

    begin(name: string, id?: number): ITraceId;
    end(tid: ITraceId): void;
}
