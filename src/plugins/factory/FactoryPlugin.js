/* @flow */

import defaultFinalizer from 'reactive-di/pluginsCommon/defaultFinalizer'
import resolveDeps from 'reactive-di/pluginsCommon/resolveDeps'
import DepsResolverImpl from 'reactive-di/pluginsCommon/DepsResolverImpl'
import {DepBaseImpl} from 'reactive-di/pluginsCommon/pluginImpls'
import type {
    DepFn,
    DepId,
    Info
} from 'reactive-di/i/annotationInterfaces'
import type {
    DepArgs,
    AnyDep,
    DepBase,
    AnnotationResolver
} from 'reactive-di/i/nodeInterfaces'
import type {Plugin} from 'reactive-di/i/pluginInterfaces' // eslint-disable-line
import type {
    FactoryDep,
    FactoryAnnotation
} from 'reactive-di/i/plugins/factoryInterfaces'
import {createFunctionProxy} from 'reactive-di/utils/createProxy'
import {fastCall} from 'reactive-di/utils/fastCall'

// implements FactoryDep
export class FactoryDepImpl<V: any> {
    kind: 'factory';
    base: DepBase;

    _value :V;
    _target: DepFn<V>;
    _depArgs: DepArgs;

    constructor(
        id: DepId,
        info: Info,
        target: DepFn<V>
    ) {
        this.kind = 'factory'
        this.base = new DepBaseImpl(id, info)
        this._target = target
    }

    init(depArgs: DepArgs): void {
        this._depArgs = depArgs
    }

    resolve(): V {
        if (!this.base.isRecalculate) {
            return this._value
        }
        const {deps, middlewares} = resolveDeps(this._depArgs)
        let fn: V = fastCall(this._target, deps);
        if (middlewares) {
            if (typeof fn !== 'function') {
                throw new Error(`No callable returns from ${this.base.info.displayName}`)
            }
            fn = createFunctionProxy(fn, middlewares)
        }
        this._value = fn
        this.base.isRecalculate = false

        return this._value
    }
}

// depends on meta
// implements Plugin
export default class FactoryPlugin {
    create<V>(annotation: FactoryAnnotation<V>, acc: AnnotationResolver): void {
        const {base} = annotation
        const dep: FactoryDepImpl<V> = new FactoryDepImpl(base.id, base.info, base.target);
        const resolver = new DepsResolverImpl(acc)
        acc.begin(dep)
        dep.init(resolver.getDeps(annotation.deps, base.target, base.info.tags))
        acc.end(dep)
    }

    finalize(dep: FactoryDep, target: AnyDep): void {
        defaultFinalizer(dep, target)
    }
}
