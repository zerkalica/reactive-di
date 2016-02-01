/* @flow */

import defaultFinalizer from '../factory/defaultFinalizer'
import resolveDeps from '../factory/resolveDeps'
import InvokerImpl from '../factory/InvokerImpl'
import MetaAnnotationImpl from '../meta/MetaAnnotationImpl'
import EntityMetaImpl, {updateMeta} from '../asyncmodel/EntityMetaImpl'
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
import type {Observable} from '../../interfaces/observableInterfaces'
import type {Plugin} from '../../interfaces/pluginInterfaces'
import {createFunctionProxy} from '../../utils/createProxy'
import {fastCall} from '../../utils/fastCall'
import type {EntityMeta} from '../asyncmodel/asyncmodelInterfaces'
import type {MetaDep} from '../meta/metaInterfaces'
import type {
    LoaderDep,
    LoaderAnnotation,
    LoaderInvoker
} from './loaderInterfaces'

// implements LoaderDep
export class LoaderDepImpl<V: Object, E> {
    kind: 'loader';
    base: DepBase;
    _meta: MetaDep<E>;
    _invoker: LoaderInvoker<V, E>;
    _value: Observable<V, E>;

    constructor(
        id: DepId,
        info: Info,
        target: DepFn<Observable<V, E>>
    ) {
        this.kind = 'loader'
        this.base = new DepBaseImpl(id, info)
        this._invoker = new InvokerImpl(target)
    }

    resolve(): Observable<V, E> {
        const {base, _invoker: invoker, _meta: meta} = this
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

    setDepArgs(depArgs: DepArgs, meta: MetaDep<E>): void {
        this._invoker.depArgs = depArgs
        this._meta = meta
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
        dep.setDepArgs(acc.getDeps(annotation.deps, base.target, info.tags), metaDep)
        acc.end(dep)
    }

    finalize(dep: LoaderDep, target: AnyDep): void {
        defaultFinalizer(dep, target)
    }
}
