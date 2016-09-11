// @flow

export type Key = Function|string
export type DepFn<V> = (...a: any) => V
export type DepDict = {[k: string]: Key}
export type ArgDep = Key | DepDict

export type DepAlias = [any, Function]
export type RegisterDepItem = any

export type ResultOf<F> = _ResultOf<*, F>
type _ResultOf<V, F: (...x: any[]) => V> = V

export interface LifeCycle<Dep> {
    /**
    * Called on first mount of any component, which uses description
     */
    onMount?: (dep: Dep) => void;

    /**
    * Called on last unmount of any component, which uses description
     */
    onUnmount?: (dep: Dep) => void;

    /**
     * Called on Dep dependencies changes
     */
    onUpdate?: (oldDep: Dep, newDep: Dep) => void;
}
