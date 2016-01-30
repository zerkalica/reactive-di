/* @flow */

import defaultFinalizer from '../factory/defaultFinalizer'
import resolveDeps from '../factory/resolveDeps'
import InvokerImpl from '../factory/InvokerImpl'
import type {
    DepFn,
    DepId,
    Info
} from '../../interfaces/annotationInterfaces'
import {DepBaseImpl} from '../../core/pluginImpls'
import type {
    AnyDep,
    DepBase,
    AnnotationResolver
} from '../../interfaces/nodeInterfaces'
import type {Observable} from '../../interfaces/observableInterfaces'
import type {Plugin} from '../../interfaces/pluginInterfaces'
import {createFunctionProxy} from '../../utils/createProxy'
import {fastCall} from '../../utils/fastCall'
import type {FactoryDep} from '../factory/factoryInterfaces'
import type {
    Setter,
    SetterDep,
    SetterAnnotation,
    SetterInvoker
} from './setterInterfaces'

// implements SetterDep
export class SetterDepImpl<V: Object, E> {
    kind: 'setter';
    base: DepBase<Setter<V>>;
    invoker: SetterInvoker<V>;
    set: (value: V|Observable<V, E>) => void;

    constructor(
        id: DepId,
        info: Info,
        target: DepFn<Setter<V>>,
        set: (value: V|Observable<V, E>) => void
    ) {
        this.kind = 'setter'
        this.base = new DepBaseImpl(id, info)
        this.invoker = new InvokerImpl(target)
        this.set = set
    }

    resolve(): void {
        const {base, invoker} = this
        if (!base.isRecalculate) {
            return
        }

        const args = resolveDeps(invoker.depArgs);
        const fn: Setter<V> = fastCall(invoker.target, args.deps);
        if (typeof fn !== 'function') {
            throw new Error('No callable returns from dep ' + base.info.displayName)
        }
        base.isRecalculate = false
        base.value = createFunctionProxy(fn, [this.set].concat(args.middlewares || []))
    }
}

// depends on factory, model
// implements Plugin
export default class SetterPlugin {
    create<V: Object, E>(annotation: SetterAnnotation<V>, acc: AnnotationResolver): void {
        const {base} = annotation
        const modelDep: AnyDep = acc.newRoot().resolve(annotation.model);
        if (modelDep.kind !== 'model') {
            throw new Error('Not a model dep type: ' + modelDep.kind)
        }
        const {updater} = modelDep
        const dep: SetterDep<V, E> = new SetterDepImpl(
            base.id,
            base.info,
            base.target,
            updater ? updater.subscribe : modelDep.set
        );
        // TODO: wait resolving setter dependencies through meta promise

        acc.begin(dep)
        dep.invoker.depArgs = acc.getDeps(annotation.deps, base.target, base.info.tags)
        acc.end(dep)
    }

    finalize(dep: FactoryDep, target: AnyDep): void {
        defaultFinalizer(dep, target)
    }
}
