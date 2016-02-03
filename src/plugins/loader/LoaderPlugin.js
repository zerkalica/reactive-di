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
    SetterCreator
} from '../setter/setterInterfaces'
import type {
    LoaderAnnotation,
    LoaderDep
} from './loaderInterfaces'
import createModelSetterCreator from '../setter/impl/createModelSetterCreator'
import type {AsyncModelDep} from '../asyncmodel/asyncmodelInterfaces'

// implements LoaderDep
class LoaderDepImpl<V: Object, E> {
    kind: 'loader';
    base: DepBase;
    _createSetter: SetterCreator;
    _model: AsyncModelDep<V, E>;

    constructor(id: DepId, info: Info) {
        this.kind = 'loader'
        this.base = new DepBaseImpl(id, info)
    }

    init(createSetter: SetterCreator, model: AsyncModelDep<V, E>): void {
        this._createSetter = createSetter
        this._model = model
    }

    resolve(): V {
        const {base, _model: model} = this
        if (!model.isSubscribed) {
            const subscribe: SetFn = this._createSetter(model);
            subscribe()
        }

        base.isRecalculate = false
        return model.resolve()
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
            throw new Error('Not an asyncmodel in ' + base.info.displayName)
        }

        dep.init(createModelSetterCreator(
            acc,
            base,
            annotation.deps
        ), model)

        acc.end(dep)
    }

    finalize(dep: LoaderDep, target: AnyDep): void {
        defaultFinalizer(dep, target)
    }
}
