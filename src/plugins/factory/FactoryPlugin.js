/* @flow */

import EntityMetaImpl, {updateMeta} from '../model/EntityMetaImpl'
import type {
    DepId,
    Info
} from '../../annotations/annotationInterfaces'
import type {
    AnyDep,
    DepBase,
    DepProcessor
} from '../../nodes/nodeInterfaces'
import type {Plugin} from '../../pluginInterfaces'
import type {AnnotationResolver} from '../../resolver/resolverInterfaces'
import type {
    AsyncUpdater,
    EntityMeta
} from '../model/modelInterfaces'
import {DepBaseImpl} from '../pluginImpls'
import type {
    FactoryDep,
    FactoryAnnotation
} from './factoryInterfaces'


// depends on model
// implements Plugin
export default class FactoryPlugin {
    factoryDep<V: Object>(
        dep: FactoryDep<V>,
        acc: DepProcessor
    ): void {
        const {base, invoker} = dep
        const {deps, middlewares} = resolveDeps(invoker.depArgs, acc)
        let fn: V = fastCall(invoker.target, deps);
        if (middlewares) {
            if (typeof fn !== 'function') {
                throw new Error('No callable returns from dep ' + base.info.displayName)
            }
            fn = createFunctionProxy(fn, middlewares)
        }
        base.value = fn
        base.isRecalculate = false
    }

    create<V>(annotation: FactoryAnnotation<V>, acc: AnnotationResolver): void {
            const {base} = annotation
            const dep: FactoryDep<V> = new FactoryDepImpl(base.id, base.info, base.target);
            acc.begin(dep)
            dep.invoker.depArgs = acc.getDeps(annotation.deps, base.id, base.info.tags)
            acc.end(dep)
        }

    finalize<E>(dep: MetaDep<E>, target: AnyDep): void {
        if (target.kind === 'model' && target.updater) {
            target.updater.metaOwners.push(dep.base)
            dep.sources.push(((target.updater: any): AsyncUpdater))
        }
    }
}
