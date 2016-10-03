// @flow

import type {Key, ArgDep, RegisterDepItem} from 'reactive-di/interfaces/deps'
import type {Adapter, Atom, Derivable} from 'reactive-di/interfaces/atom'
import type {SrcComponent} from 'reactive-di/interfaces/component'

export interface IDi {
    displayName: string;

    val<V>(key: Key): Atom<V>;
    stop(): IDi;
    create(displayName: string): IDi;
    register(registered?: ?RegisterDepItem[]): IDi;
    values(values?: ?{[id: string]: mixed}): IDi;
    wrapComponent<Component>(key: SrcComponent<*, *>): Component;
}

/**
 * Context, used internally by di handlers
 */
export type IContext = {
    stopped: Atom<boolean>;

    adapter: Adapter;
    defaults: {[id: string]: mixed};
    resolveDeps(deps: ArgDep[]): Derivable<mixed[]>;
    debugStr(data: mixed): string;
    preprocess<V: any>(data: V, di: any): V;

    stop(): IContext;
    create(displayName: string): IContext;
    register(registered?: ?RegisterDepItem[]): IContext;
    values(values?: ?{[id: string]: mixed}): IContext;
} & IDi
