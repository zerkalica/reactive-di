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
    DepBase
} from 'reactive-di/i/nodeInterfaces'
import type {AnnotationResolver} from 'reactive-di/i/nodeInterfaces'
import type {Plugin} from 'reactive-di/i/pluginInterfaces' // eslint-disable-line
import {createObjectProxy} from 'reactive-di/utils/createProxy'
import {fastCreateObject} from 'reactive-di/utils/fastCall'
import type {
    ClassDep,
    ClassAnnotation,
    ClassInvoker
} from 'reactive-di/plugins/class/classInterfaces'

// implements ClassDep
export class ClassDepImpl<V: Object> {
    kind: 'class';
    base: DepBase;
    _invoker: ClassInvoker<V>;
    _value: V;

    constructor(
        id: DepId,
        info: Info,
        target: Class<V> // eslint-disable-line
    ) {
        this.kind = 'class'
        this.base = new DepBaseImpl(id, info)
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

    setInvoker(invoker: ClassInvoker<V>): void {
        this._invoker = invoker
    }
}


// depends on factory
// implements Plugin
export default class ClassPlugin {
    create<V: Object>(annotation: ClassAnnotation<V>, acc: AnnotationResolver): void {
        const {base} = annotation
        const dep: ClassDepImpl<V> = new ClassDepImpl(base.id, base.info, base.target);
        acc.begin(dep)
        dep.setInvoker(new InvokerImpl(
            base.target,
            acc.getDeps(annotation.deps, base.target, base.info.tags)
        ))
        acc.end(dep)
    }

    finalize(dep: ClassDep, target: AnyDep): void {
        defaultFinalizer(dep, target)
    }
}
