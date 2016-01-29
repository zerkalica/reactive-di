/* @flow */

import type {HooksRec} from '../../annotationInterfaces'
import type {DepArgs} from '../../pluginInterfaces'
import type {
    Invoker,
    Hooks
} from './factoryInterfaces'

function defaultFn(): void {}

// implements Hooks
class HooksImpl<T> {
    onUnmount: () => void;
    onMount: () => void;
    onUpdate: (currentValue: T, nextValue: T) => void;

    constructor(r: HooksRec<T> = {}) {
        this.onMount = r.onMount || defaultFn
        this.onUnmount = r.onUnmount || defaultFn
        this.onUpdate = r.onUpdate || defaultFn
    }
}

// implements Invoker
export default class InvokerImpl<V, T, M> {
    hooks: Hooks<V>;
    target: T;
    depArgs: DepArgs<M>;

    constructor(target: T, hooks: ?HooksRec<V>, middlewares: ?Array<M>) {
        this.target = target
        this.hooks = new HooksImpl(hooks || {})
    }
}
