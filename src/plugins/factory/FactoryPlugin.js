/* @flow */

import defaultFinalizer from 'reactive-di/plugins/factory/defaultFinalizer'
import resolveDeps from 'reactive-di/plugins/factory/resolveDeps'
import InvokerImpl from 'reactive-di/plugins/factory/InvokerImpl'
import {DepBaseImpl} from 'reactive-di/core/pluginImpls'
import type {
    DepId,
    Info
} from 'reactive-di/i/annotationInterfaces'
import type {
    AnyDep,
    DepBase,
    AnnotationResolver
} from 'reactive-di/i/nodeInterfaces'
import type {Plugin} from 'reactive-di/i/pluginInterfaces' // eslint-disable-line
import {createFunctionProxy} from 'reactive-di/utils/createProxy'
import {fastCall} from 'reactive-di/utils/fastCall'
import type {
    FactoryDep,
    FactoryAnnotation,
    FactoryInvoker
} from 'reactive-di/plugins/factory/factoryInterfaces'

// implements FactoryDep
export class FactoryDepImpl<V: any> {
    kind: 'factory';
    base: DepBase;
    _invoker: FactoryInvoker<V>;
    _value :V;

    constructor(
        id: DepId,
        info: Info
    ) {
        this.kind = 'factory'
        this.base = new DepBaseImpl(id, info)
    }

    init(invoker: FactoryInvoker<V>): void {
        this._invoker = invoker
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
}

// depends on meta
// implements Plugin
export default class FactoryPlugin {
    create<V>(annotation: FactoryAnnotation<V>, acc: AnnotationResolver): void {
        const {base} = annotation
        const dep: FactoryDepImpl<V> = new FactoryDepImpl(base.id, base.info, base.target);
        acc.begin(dep)
        dep.init(new InvokerImpl(
            base.target,
            acc.getDeps(annotation.deps, base.target, base.info.tags)
        ))
        acc.end(dep)
    }

    finalize(dep: FactoryDep, target: AnyDep): void {
        defaultFinalizer(dep, target)
    }
}
