/* @flow */

import defaultFinalizer from 'reactive-di/pluginsCommon/defaultFinalizer'
import resolveDeps from 'reactive-di/pluginsCommon/resolveDeps'
import DepsResolverImpl from 'reactive-di/pluginsCommon/DepsResolverImpl'
import {DepBaseImpl} from 'reactive-di/pluginsCommon/pluginImpls'
import type {
    DepFn
} from 'reactive-di/i/annotationInterfaces'
import type {
    DepArgs,
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

    constructor(annotation: FactoryAnnotation<V>) {
        this.kind = 'factory'
        this.base = new DepBaseImpl(annotation)
        this._target = annotation.target
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
                throw new Error(`No callable returns from ${this.base.displayName}`)
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
    kind: 'factory' = 'factory';

    create<V>(annotation: FactoryAnnotation<V>, acc: AnnotationResolver): void {
        annotation.id = acc.createId() // eslint-disable-line
        const dep = new FactoryDepImpl(annotation);
        const resolver = new DepsResolverImpl(acc)
        acc.begin(dep)
        dep.init(resolver.getDeps(annotation.deps, annotation.target, dep.base.tags))
        acc.end(dep)
    }

    finalize<AnyDep: Object>(dep: FactoryDep, target: AnyDep): void {
        defaultFinalizer(dep.base, target)
    }
}
