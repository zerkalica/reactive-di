// @flow

import type {IArg, IGetable} from './utils/resolveArgs'
import type {IControllable, ISource, IStatus} from './source/interfaces'
import type {INotifier, IHook} from './hook/interfaces'
import type {IComputed} from './computed/interfaces'
import type {IComponent, IConsumerFactory, IComponentFactory, IConsumer} from './consumer/interfaces'
import type {IHasDispose, IDisposable, IDisposableCollection} from './utils/DisposableCollection'
import type {IRawArg, IDepRegister} from './interfaces'

interface IProtoFactory {
    resolveSource<V: Object>(key: Function): IGetable<V>;
}

export type IParent = IStatus<*> | IHook<*> | IComputed<*> | IConsumer<*>

export interface IRelationItem {
    has: boolean[];
    v: IParent;
    ender: boolean;
}

export interface IRelationBinder {
    stack: IRelationItem[];
    level: number;
    lastId: number;
    values: {[id: string]: any};
    status: ?IStatus<*>;
    debugStr(sub: ?mixed): string;
    begin(dep: IParent, isEnder: boolean): void;
    end(): void;
}

export type ICacheItem = {
    id: number;
    context: IContext;
}

export type IStaticContext<Component, Element> = {
    defaultErrorComponent: Component;
    binder: IRelationBinder;
    notifier: INotifier;
    componentFactory: IComponentFactory<Component, Element>;
    protoFactory: ?IContext;
    Updater: Class<IControllable>;
}

type Component = any
type Element = any

export interface IContext extends IStaticContext<Component, Element>, IDisposable {
    resolveDeps(args: IRawArg[]): IArg[];
    dispose(): void;
    copy(name: string): IContext;
    register(deps?: ?IDepRegister[]): IContext;
    wrapComponent<Props: Object, State: Object>(component: IComponent<Props, State, Element>): Component;

    items: ICacheItem[];
    disposables: IDisposableCollection<IHasDispose>;
    resolveConsumer<V: Object>(key: Function): IConsumerFactory<V, Element, Component>;
    resolveSource<V: Object>(key: Function): ISource<V>;
}
