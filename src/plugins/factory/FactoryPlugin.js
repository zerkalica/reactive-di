/* @flow */

import defaultFinalizer from './defaultFinalizer'
import resolveDeps from './resolveDeps'
import InvokerImpl from './InvokerImpl'
import {DepBaseImpl} from '../../core/pluginImpls'
import type {
    DepFn,
    DepId,
    Info
} from '../../interfaces/annotationInterfaces'
import type {
    DepArgs,
    AnyDep,
    DepBase,
    AnnotationResolver,
} from '../../interfaces/nodeInterfaces'
import type {Plugin} from '../../interfaces/pluginInterfaces'
import {createFunctionProxy} from '../../utils/createProxy'
import {fastCall} from '../../utils/fastCall'
import type {
    FactoryDep,
    FactoryAnnotation,
    FactoryInvoker
} from './factoryInterfaces'

// implements FactoryDep
export class FactoryDepImpl<V: any> {
    kind: 'factory';
    base: DepBase;
    _invoker: FactoryInvoker<V>;
    _value :V;

    constructor(
        id: DepId,
        info: Info,
        target: DepFn<V>
    ) {
        this.kind = 'factory'
        this.base = new DepBaseImpl(id, info)
    }

    resolve(): V {
        const {base, _invoker: invoker} = this
        if (!base.isRecalculate) {
            return this._value
        }
        const {deps, middlewares} = resolveDeps(invoker.depArgs)
        let fn: V = fastCall(invoker.target, deps);
        if (middlewares) {
            if (typeof fn !== 'function') {
                throw new Error('No callable returns from dep ' + base.info.displayName)
            }
            fn = createFunctionProxy(fn, middlewares)
        }
        this._value = fn
        base.isRecalculate = false

        return this._value
    }

    setInvoker(invoker: FactoryInvoker<V>): void {
        this._invoker = invoker
    }
}

// depends on meta
// implements Plugin
export default class FactoryPlugin {
    create<V>(annotation: FactoryAnnotation<V>, acc: AnnotationResolver): void {
        const {base} = annotation
        const dep: FactoryDepImpl<V> = new FactoryDepImpl(base.id, base.info, base.target);
        acc.begin(dep)
        dep.setInvoker(new InvokerImpl(
            base.target,
            acc.getDeps(annotation.deps, base.target, base.info.tags)
        ))
        acc.end(dep)
    }

    finalize(dep: FactoryDep, target: AnyDep): void {
        defaultFinalizer(dep, target)
    }
}
