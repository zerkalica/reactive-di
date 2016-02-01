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
import type {
    DepArgs,
    AnyDep,
    DepBase
} from '../../interfaces/nodeInterfaces'
import type {Plugin} from '../../interfaces/pluginInterfaces'
import type {AnnotationResolver} from '../../interfaces/nodeInterfaces'
import {createObjectProxy} from '../../utils/createProxy'
import {fastCreateObject} from '../../utils/fastCall'
import type {
    AsyncUpdater,
    EntityMeta
} from '../model/modelInterfaces'
import {DepBaseImpl} from '../../core/pluginImpls'
import type {
    ClassDep,
    ClassAnnotation,
    ClassInvoker
} from './classInterfaces'

// implements ClassDep
export class ClassDepImpl<V: Object> {
    kind: 'class';
    base: DepBase;
    _invoker: ClassInvoker<V>;
    _value: V;

    constructor(
        id: DepId,
        info: Info,
        target: Class<V>
    ) {
        this.kind = 'class'
        this.base = new DepBaseImpl(id, info)
        this._invoker = new InvokerImpl(target)
    }

    resolve(): V {
        const {base, _invoker: invoker} = this
        if (!base.isRecalculate) {
            return this._value
        }
        const args = resolveDeps(invoker.depArgs)
        let obj: V = fastCreateObject(invoker.target, args.deps);
        if (args.middlewares) {
            obj = createObjectProxy(obj, args.middlewares)
        }
        base.isRecalculate = false
        this._value = obj

        return this._value
    }

    setDepArgs(depArgs: DepArgs): void {
        this._invoker.depArgs = depArgs
    }
}


// depends on factory
// implements Plugin
export default class ClassPlugin {
    create<V: Object>(annotation: ClassAnnotation<V>, acc: AnnotationResolver): void {
        const {base} = annotation
        const dep: ClassDep<V> = new ClassDepImpl(base.id, base.info, base.target);
        acc.begin(dep)
        dep.setDepArgs(acc.getDeps(annotation.deps, base.target, base.info.tags))
        acc.end(dep)
    }

    finalize(dep: ClassDep, target: AnyDep): void {
        defaultFinalizer(dep, target)
    }
}
