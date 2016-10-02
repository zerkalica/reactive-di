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
    * Called before dep update, if returned true - component updated
     */
    isEqual?: (oldDep: Dep, newDep: Dep) => boolean;

    /**
    * Called before first mount of any component, works on server side
     */
    onWillMount?: (dep: Dep) => void;

    /**
    * Called on first mount of any component
     */
    onMount?: (dep: Dep) => void;

    /**
    * Called on last unmount of any component
     */
    onUnmount?: (dep: Dep) => void;

    /**
     * Called on Dep dependencies changes
     */
    onUpdate?: (oldDep: Dep, newDep: Dep) => void;
}
