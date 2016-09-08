// @flow

export type Key = Function|string
export type DepFn<V> = (...a: any) => V
export type DepDict = {[k: string]: Key}
export type ArgDep = Key | DepDict

export type DepAlias = [Function, Function]
export type RegisterDepItem = DepAlias | Function

export type ResultOf<F> = _ResultOf<*, F>
type _ResultOf<V, F: (...x: any[]) => V> = V

export interface LifeCycle<Dep> {
    onMount?: (dep: Dep) => void;
    onUnmount?: (dep: Dep) => void;
    onAfterUpdate?: (dep: Dep) => void;
    onUpdate?: (oldDep: Dep, newDep: Dep) => void;
}
