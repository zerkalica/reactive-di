/* @flow */

import defaultFinalizer from 'reactive-di/pluginsCommon/defaultFinalizer'
import resolveDeps from 'reactive-di/pluginsCommon/resolveDeps'
import DepsResolverImpl from 'reactive-di/pluginsCommon/DepsResolverImpl'
import {DepBaseImpl} from 'reactive-di/pluginsCommon/pluginImpls'
import type {
    DepId,
    Info
} from 'reactive-di/i/annotationInterfaces'
import type {
    DepArgs,
    AnyDep,
    DepBase
} from 'reactive-di/i/nodeInterfaces'
import type {AnnotationResolver} from 'reactive-di/i/nodeInterfaces'
import type {Plugin} from 'reactive-di/i/pluginInterfaces' // eslint-disable-line
import {createObjectProxy} from 'reactive-di/utils/createProxy'
import {fastCreateObject} from 'reactive-di/utils/fastCall'
import type {
    ClassDep,
    ClassAnnotation
} from 'reactive-di/i/plugins/classInterfaces'

// implements ClassDep
export class ClassDepImpl<V: Object> {
    kind: 'class';
    base: DepBase;
    _depArgs: DepArgs;
    _value: V;
    _target: Class<V>;

    constructor(
        id: DepId,
        info: Info,
        target: Class<V>
    ) {
        this.kind = 'class'
        this.base = new DepBaseImpl(id, info)
        this._target = target
    }

    resolve(): V {
        if (!this.base.isRecalculate) {
            return this._value
        }
        const args = resolveDeps(this._depArgs)
        let obj: V = fastCreateObject(this._target, args.deps);
        if (args.middlewares) {
            obj = createObjectProxy(obj, args.middlewares)
        }
        this.base.isRecalculate = false
        this._value = obj

        return this._value
    }

    init(depArgs: DepArgs): void {
        this._depArgs = depArgs
    }
}

// depends on factory
// implements Plugin
export default class ClassPlugin {
    create<V: Object>(annotation: ClassAnnotation<V>, acc: AnnotationResolver): void {
        const {base} = annotation
        const dep: ClassDepImpl<V> = new ClassDepImpl(base.id, base.info, base.target);
        const resolver = new DepsResolverImpl(acc)
        acc.begin(dep)
        dep.init(resolver.getDeps(annotation.deps, base.target, base.info.tags))
        acc.end(dep)
    }

    finalize(dep: ClassDep, target: AnyDep): void {
        defaultFinalizer(dep, target)
    }
}
