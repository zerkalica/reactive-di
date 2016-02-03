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
import type {SetFn} from '../setter/setterInterfaces'
import type {
    LoaderAnnotation,
    LoaderDep
} from './loaderInterfaces'

export type Resolvable<V> = {
    resolve(): V;
};

// implements LoaderDep
class LoaderDepImpl<V: Object, E> {
    kind: 'loader';
    base: DepBase;
    _setter: Resolvable<SetFn>;
    _model: Resolvable<V>;

    constructor(id: DepId, info: Info) {
        this.kind = 'loader'
        this.base = new DepBaseImpl(id, info)
    }

    init(setter: Resolvable<SetFn>, model: Resolvable<V>): void {
        this._setter = setter
        this._model = model
    }

    resolve(): V {
        const {base, _setter: setter} = this
        if (base.isRecalculate) {
            setter.resolve()()
        }

        base.isRecalculate = false

        return this._model.resolve()
    }
}

// depends on setter
// implements Plugin
export default class LoaderPlugin {
    create<V: Object, E>(annotation: LoaderAnnotation<V, E>, acc: AnnotationResolver): void {
        const {base} = annotation
        const dep: LoaderDepImpl<V, E> = new LoaderDepImpl(base.id, base.info);
        acc.begin(dep)
        dep.init(
            ((acc.resolve(annotation.setter): any): Resolvable<SetFn>),
            ((acc.resolve(base.target): any): Resolvable<V>)
        )
        acc.end(dep)
    }

    finalize(dep: FactoryDep, target: AnyDep): void {
        defaultFinalizer(dep, target)
    }
}
