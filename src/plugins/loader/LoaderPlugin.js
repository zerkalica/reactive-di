/* @flow */

import defaultFinalizer from '../factory/defaultFinalizer'
import SetterAnnotationImpl from '../setter/SetterAnnotationImpl'
import {DepBaseImpl} from '../../core/pluginImpls'
import type {
    DepId,
    Info
} from '../../interfaces/annotationInterfaces'
import type {
    AnyDep,
    Cacheable,
    DepBase,
    AnnotationResolver
} from '../../interfaces/nodeInterfaces'
import type {Plugin} from '../../interfaces/pluginInterfaces' // eslint-disable-line
import type {AsyncModelDep} from '../asyncmodel/asyncmodelInterfaces'
import type {
    SetFn,
    SetterDep
} from '../setter/setterInterfaces'
import type {
    LoaderAnnotation,
    LoaderDep
} from './loaderInterfaces'

// implements LoaderDep
class LoaderDepImpl<V: Object, E> {
    kind: 'loader';
    base: DepBase;
    dataOwners: Array<Cacheable>;

    _setterDep: SetterDep;
    _model: AsyncModelDep<V, E>;
    _value: V;
    _setter: ?SetFn;

    constructor(id: DepId, info: Info) {
        this.kind = 'loader'
        this.base = new DepBaseImpl(id, info)
        this._setter = null
    }

    init(setterDep: SetterDep, model: AsyncModelDep<V, E>): void {
        this._setterDep = setterDep
        this._model = model
    }

    reset(): void {
        this._setterDep.unsubscribe()
        this._model.reset()
        this._setter = null
    }

    resolve(): V {
        if (!this.base.isRecalculate) {
            return this._value
        }

        const {base, _model: model, _setterDep: setterDep} = this
        const setter: SetFn = setterDep.resolve();
        if (this._setter !== setter) {
            this._setter = setter
            setter()
        }

        base.isRecalculate = false
        this._value = model.resolve()
        return this._value
    }
}

// depends on setter
// implements Plugin
export default class LoaderPlugin {
    create<V: Object, E>(annotation: LoaderAnnotation<V, E>, acc: AnnotationResolver): void {
        const {base} = annotation
        const dep: LoaderDepImpl<V, E> = new LoaderDepImpl(base.id, base.info);
        acc.begin(dep)
        const model: AnyDep = acc.resolve(annotation.model);
        if (model.kind !== 'asyncmodel') {
            throw new Error(
                `Not an asyncmodel ${model.base.info.displayName} in ${base.info.displayName}`
            )
        }
        const setterDep: AnyDep = acc.resolveAnnotation(new SetterAnnotationImpl(
            `${base.id}.setter`,
            annotation.model,
            base.target,
            annotation.deps,
            base.info.tags
        ));
        if (setterDep.kind !== 'setter') {
            throw new Error(
                `Not a setter: ${setterDep.base.info.displayName} in ${base.info.displayName}`
            )
        }

        dep.init(setterDep, model)

        acc.end(dep)
    }

    finalize(dep: LoaderDep, target: AnyDep): void {
        defaultFinalizer(dep, target)
    }
}
