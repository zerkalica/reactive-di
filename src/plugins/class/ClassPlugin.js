/* @flow */

import defaultFinalizer from '../factory/defaultFinalizer'
import resolveDeps from '../factory/resolveDeps'
import InvokerImpl from '../factory/InvokerImpl'
import EntityMetaImpl, {updateMeta} from '../model/EntityMetaImpl'
import type {
    DepFn,
    DepId,
    Info
} from '../../annotationInterfaces'
import type {
    AnyDep,
    DepBase,
    DependencyResolver
} from '../../nodeInterfaces'
import type {Plugin} from '../../pluginInterfaces'
import type {AnnotationResolver} from '../../resolver/resolverInterfaces'
import {createObjectProxy} from '../../utils/createProxy'
import {fastCreateObject} from '../../utils/fastCall'
import type {
    AsyncUpdater,
    EntityMeta
} from '../model/modelInterfaces'
import {DepBaseImpl} from '../pluginImpls'
import type {
    ClassDep,
    ClassAnnotation,
    ClassInvoker
} from './classInterfaces'

// implements ClassDep
export class ClassDepImpl<V: Object> {
    kind: 'class';
    base: DepBase<V>;
    invoker: ClassInvoker<V>;

    constructor(
        id: DepId,
        info: Info,
        target: Class<V>
    ) {
        this.kind = 'class'
        this.base = new DepBaseImpl(id, info)
        this.invoker = new InvokerImpl(target)
    }
}

// depends on factory
// implements Plugin
export default class ClassPlugin {
    resolve<V: Object>(annotation: ClassAnnotation<V>, acc: AnnotationResolver): void {
        const {base} = annotation
        const dep: ClassDep<V> = new ClassDepImpl(base.id, base.info, base.target);
        acc.begin(dep)
        dep.invoker.depArgs = acc.getDeps(annotation.deps, base.id, base.info.tags)
        acc.end(dep)
    }

    create<V: Object>(dep: ClassDep<V>, acc: DependencyResolver): void {
        const {base, invoker} = dep
        const {deps, middlewares} = resolveDeps(invoker.depArgs, acc)
        let obj: V = fastCreateObject(invoker.target, deps);
        if (middlewares) {
            obj = createObjectProxy(obj, middlewares)
        }
        base.isRecalculate = false
        base.value = obj
    }

    finalize(dep: ClassDep, target: AnyDep): void {
        defaultFinalizer(dep, target)
    }
}
