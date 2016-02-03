/* @flow */

import defaultFinalizer from '../factory/defaultFinalizer'
import InvokerImpl from '../factory/InvokerImpl'
import MetaAnnotationImpl from '../meta/MetaAnnotationImpl'
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
    AnnotationResolver
} from '../../interfaces/nodeInterfaces'
import type {Observable} from '../../interfaces/observableInterfaces'
import type {Plugin} from '../../interfaces/pluginInterfaces'
import {createFunctionProxy} from '../../utils/createProxy'
import {fastCall} from '../../utils/fastCall'
import type {AnyUpdater, AsyncModelDep} from '../asyncmodel/asyncmodelInterfaces'
import type {
    Invoker,
    FactoryDep
} from '../factory/factoryInterfaces'
import type {MetaDep} from '../meta/metaInterfaces'
import type {ModelDep} from '../model/modelInterfaces'
import type {
    SetterDep,
    SetterAnnotation,
    SetFn
} from './setterInterfaces'
import createModelSetter from './createModelSetter'

type SetterInvoker<V, E> = Invoker<AnyUpdater<V, E>, FactoryDep>;

// implements SetterDep
export class SetterDepImpl<V: Object, E> {
    kind: 'setter';
    base: DepBase;

    _value: SetFn;

    constructor(id: DepId, info: Info) {
        this.kind = 'setter'
        this.base = new DepBaseImpl(id, info);
    }

    init(
        invoker: SetterInvoker<V, E>,
        modelDep: ModelDep|AsyncModelDep,
        metaDep: MetaDep<E>
    ): void {
        this._value = createModelSetter(
            invoker,
            this.base.info,
            modelDep,
            metaDep
        )
    }

    resolve(): SetFn {
        const {base} = this
        if (!base.isRecalculate) {
            return this._value
        }

        base.isRecalculate = false

        return this._value
    }
}

// depends on factory, model
// implements Plugin
export default class SetterPlugin {
    create<V: Object, E>(annotation: SetterAnnotation<V, E>, acc: AnnotationResolver): void {
        const {base} = annotation
        const {info} = base
        const modelDep: AnyDep = (acc.newRoot().resolve(annotation.model) : any);
        if (modelDep.kind !== 'model' && modelDep.kind !== 'asyncmodel') {
            throw new Error('Not a model dep type: ' + modelDep.kind + ' in ' + modelDep.base.info.displayName)
        }
        const dep: SetterDepImpl<V, E> = new SetterDepImpl(base.id, info);
        acc.begin(dep)

        const metaDep: MetaDep<E> = (acc.newRoot().resolveAnnotation(new MetaAnnotationImpl(
            base.id + '.meta',
            base.target,
            info.tags
        )): any);

        dep.init(
            new InvokerImpl(base.target, acc.getDeps(annotation.deps, base.target, info.tags)),
            modelDep,
            metaDep
        )

        acc.end(dep)
    }

    finalize(dep: SetterDep, target: AnyDep): void {
        defaultFinalizer(dep, target)
    }
}
