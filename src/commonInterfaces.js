// @flow

import type {IArg} from './computed/resolveArgs'
import type {INotifier, IRelationBinder, ISource} from './source/interfaces'
import type {IHasDispose, IDisposableCollection} from './utils/DisposableCollection'
import type {IRawArg, IDepRegister} from './interfaces'
import type {CreateVNode} from './adapters/inferno'
import type {ICreateComponent} from './consumer/interfaces'

export interface IContext {
    closed: boolean;
    notifier: INotifier;
    protoFactory: ?IContext;
    values: {[id: string]: any};
    disposables: IDisposableCollection<IHasDispose>;
    +h: CreateVNode;
    binder: IRelationBinder;
    createComponent: ICreateComponent;
    resolveDeps(args: IRawArg[]): IArg[];
    dispose(): void;
    copy(name: string): IContext;
    register(deps?: ?IDepRegister[]): IContext;
    resolveSource<V: Object>(key: Function): ISource<V, *>;
}

export type IStaticContext = {
    createVNode: CreateVNode;
    createComponent: ICreateComponent;
    binder: IRelationBinder;
    notifier: INotifier;
    protoFactory: ?IContext;
    values: {[id: string]: any};
}
