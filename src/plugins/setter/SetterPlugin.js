/* @flow */

import createModelSetterCreator from './impl/createModelSetterCreator'
import defaultFinalizer from '../factory/defaultFinalizer'
import InvokerImpl from '../factory/InvokerImpl'
import MetaAnnotationImpl from '../meta/MetaAnnotationImpl'
import {DepBaseImpl} from '../../core/pluginImpls'
import type {
    DepId,
    Info
} from '../../interfaces/annotationInterfaces'
import type {
    DepArgs,
    AnyDep,
    DepBase,
    AnnotationResolver
} from '../../interfaces/nodeInterfaces'
import type {Plugin} from '../../interfaces/pluginInterfaces'
import type {MetaDep} from '../meta/metaInterfaces'
import type {
    AnyModelDep,
    SetterDep,
    SetterCreator,
    SetterAnnotation,
    SetFn
} from './setterInterfaces'

// implements SetterDep
export class SetterDepImpl<V: Object, E> {
    kind: 'setter';
    base: DepBase;
    _value: SetFn;
    _createSetter: SetterCreator;
    _model: AnyModelDep<V, E>;

    constructor(id: DepId, info: Info) {
        this.kind = 'setter'
        this.base = new DepBaseImpl(id, info);
    }

    init(createSetter: SetterCreator, model: AnyModelDep<V, E>): void {
        this._createSetter = createSetter
        this._model = model
    }

    resolve(): SetFn {
        const {base} = this
        if (!base.isRecalculate) {
            return this._value
        }

        this._value = this._createSetter(this._model)

        base.isRecalculate = false

        return this._value
    }
}

// depends on factory, model
// implements Plugin
export default class SetterPlugin {
    create<V: Object, E>(annotation: SetterAnnotation<V, E>, acc: AnnotationResolver): void {
        const {base} = annotation
        const dep: SetterDepImpl<V, E> = new SetterDepImpl(base.id, base.info);
        acc.begin(dep)
        const newAcc = acc.newRoot()
        const model: AnyDep = newAcc.resolve(annotation.model);
        if (model.kind !== 'model' && model.kind !== 'asyncmodel') {
            throw new Error('Not a model dep type: ' + model.kind + ' in ' + model.base.info.displayName)
        }
        const {id, target, info} = base
        const meta: MetaDep<E> = (newAcc.resolveAnnotation(new MetaAnnotationImpl(
            id + '.meta',
            target,
            info.tags
        )): any);

        const invoker = new InvokerImpl(target, acc.getDeps(annotation.deps, target, info.tags));

        dep.init(createModelSetterCreator(
            acc.notify,
            meta,
            invoker,
            info
        ), model)
        acc.end(dep)
    }

    finalize(dep: SetterDep, target: AnyDep): void {
        defaultFinalizer(dep, target)
    }
}
