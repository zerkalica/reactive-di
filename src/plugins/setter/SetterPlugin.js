/* @flow */

import createModelSetterCreator from './impl/createModelSetterCreator'
import defaultFinalizer from '../factory/defaultFinalizer'
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
import type {
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

    constructor(id: DepId, info: Info) {
        this.kind = 'setter'
        this.base = new DepBaseImpl(id, info);
    }

    init(createSetter: SetterCreator): void {
        this._createSetter = createSetter
    }

    resolve(): SetFn {
        const {base} = this
        if (!base.isRecalculate) {
            return this._value
        }

        this._value = this._createSetter()

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
        dep.init(createModelSetterCreator(
            acc,
            annotation.model,
            base,
            annotation.deps
        ))
        acc.end(dep)
    }

    finalize(dep: SetterDep, target: AnyDep): void {
        defaultFinalizer(dep, target)
    }
}
