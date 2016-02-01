/* @flow */

import defaultFinalizer from '../factory/defaultFinalizer'
import resolveDeps from '../factory/resolveDeps'
import InvokerImpl from '../factory/InvokerImpl'
import EntityMetaImpl, {updateMeta} from '../model/EntityMetaImpl'
import type {
    DepFn,
    DepId,
    Info
} from '../../interfaces/annotationInterfaces'
import {DepBaseImpl} from '../../core/pluginImpls'
import type {
    AnyDep,
    DepBase,
    AnnotationResolver,
} from '../../interfaces/nodeInterfaces'
import type {Plugin} from '../../interfaces/pluginInterfaces'
import {createFunctionProxy} from '../../utils/createProxy'
import {fastCall} from '../../utils/fastCall'
import type {EntityMeta} from '../model/modelInterfaces'
import type {
    LoaderDep,
    LoaderAnnotation,
    LoaderInvoker
} from './loaderInterfaces'
import type {MetaDep} from '../meta/metaInterfaces'
import MetaAnnotationImpl from '../meta/MetaAnnotationImpl'
import type {Observable} from '../../interfaces/observableInterfaces'

// implements LoaderDep
export class LoaderDepImpl<V: Object, E> {
    kind: 'loader';
    base: DepBase;
    meta: MetaDep<E>;
    invoker: LoaderInvoker<V, E>;
    _value: Observable<V, E>;

    constructor(
        id: DepId,
        info: Info,
        target: DepFn<Observable<V, E>>
    ) {
        this.kind = 'loader'
        this.base = new DepBaseImpl(id, info)
        this.invoker = new InvokerImpl(target)
    }

    resolve(): Observable<V, E> {
        const {base, invoker, meta} = this
        if (!base.isRecalculate) {
            return this._value
        }
        const value: EntityMeta<E> = meta.resolve();
        if (!value.fulfilled) {
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

        return fn
    }
}

// depends on meta
// implements Plugin
export default class LoaderPlugin {
    create<V: Object, E>(annotation: LoaderAnnotation<V, E>, acc: AnnotationResolver): void {
        const {base} = annotation
        const {info} = base
        const dep: LoaderDep<V, E> = new LoaderDepImpl(base.id, info, base.target);
        acc.begin(dep)
        const metaDep: AnyDep = acc.resolveAnnotation(new MetaAnnotationImpl(base.target, info.tags));
        if (metaDep.kind !== 'meta') {
            throw new Error('Not a meta type: ' + metaDep.kind)
        }
        dep.meta = metaDep
        dep.invoker.depArgs = acc.getDeps(annotation.deps, base.target, info.tags)
        acc.end(dep)
    }

    finalize(dep: LoaderDep, target: AnyDep): void {
        defaultFinalizer(dep, target)
    }
}
