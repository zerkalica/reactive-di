/* @flow */

import type {HooksRec} from 'reactive-di/i/annotationInterfaces'
import type {DepArgs} from 'reactive-di/i/nodeInterfaces'
import type {
    Invoker, // eslint-disable-line
    Hooks
} from 'reactive-di/plugins/factory/factoryInterfaces'

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

    constructor(target: T, depArgs: DepArgs<M>, hooks: ?HooksRec<V>) {
        this.target = target
        this.hooks = new HooksImpl(hooks || {})
        this.depArgs = depArgs
    }
}
