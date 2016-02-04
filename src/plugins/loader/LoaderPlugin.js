/* @flow */

import defaultFinalizer from '../factory/defaultFinalizer'
import resolveDeps from '../factory/resolveDeps'
import InvokerImpl from '../factory/InvokerImpl'
import MetaAnnotationImpl from '../meta/MetaAnnotationImpl'
import SetterAnnotationImpl from '../setter/SetterAnnotationImpl'
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
import type {FactoryDep} from '../factory/factoryInterfaces'
import type {MetaDep} from '../meta/metaInterfaces'
import type {
    SetFn,
    SetterDep,
} from '../setter/setterInterfaces'
import type {
    LoaderAnnotation,
    LoaderDep
} from './loaderInterfaces'
import type {AsyncModelDep} from '../asyncmodel/asyncmodelInterfaces'
import SetterAnnotationImpl from '../setter/setterInterfaces'
// implements LoaderDep
class LoaderDepImpl<V: Object, E> {
    kind: 'loader';
    base: DepBase;
    _setterDep: SetterDep;
    _model: AsyncModelDep<V, E>;
    _setter: SetFn;
    _value: V;

    constructor(id: DepId, info: Info) {
        this.kind = 'loader'
        this.base = new DepBaseImpl(id, info)
    }

    init(setterDep: SetterDep, model: AsyncModelDep<V, E>): void {
        this._setterDep = setterDep
        this._model = model
    }

    resolve(): V {
        if (!this.base.isRecalculate) {
            return this._value
        }

        const {base, _model: model, _setterDep: setterDep} = this
        const setter: SetFn = setterDep.resolve();
        if (setter !== this._setter) {
            setter()
            this._setter = setter
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
            throw new Error('Not an asyncmodel ' + model.base.info.displayName
                + ' in ' + base.info.displayName)
        }
        const setterDep: AnyDep = acc.resolveAnnotation(new SetterAnnotationImpl(
            base.id + '.setter',
            annotation.model,
            base.target,
            annotation.deps,
            base.info.tags
        ));
        if (setterDep.kind !== 'setter') {
            throw new Error ('Not a setter: ' + setterDep.base.info.displayName
                + ' in ' + base.info.displayName)
        }

        dep.init(setterDep, model)

        acc.end(dep)
    }

    finalize(dep: LoaderDep, target: AnyDep): void {
        defaultFinalizer(dep, target)
    }
}
