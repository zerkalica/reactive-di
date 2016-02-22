/* @flow */

import defaultFinalizer from 'reactive-di/pluginsCommon/defaultFinalizer'
import AsyncSetterAnnotationImpl from 'reactive-di/plugins/setter/AsyncSetterAnnotationImpl'
import {DepBaseImpl} from 'reactive-di/pluginsCommon/pluginImpls'
import type {
    DepId,
    Info
} from 'reactive-di/i/annotationInterfaces'
import type {
    AnyDep,
    DepBase,
    AnnotationResolver
} from 'reactive-di/i/nodeInterfaces'
import type {Plugin} from 'reactive-di/i/pluginInterfaces' // eslint-disable-line
import type {
    SetFn,
    AsyncSetterDep
} from 'reactive-di/i/plugins/setterInterfaces'
import type {
    LoaderAnnotation,
    LoaderDep
} from 'reactive-di/i/plugins/loaderInterfaces'
import type {ModelDep} from 'reactive-di/i/plugins/modelInterfaces'

// implements LoaderDep
class LoaderDepImpl<V: Object> {
    kind: 'loader';
    base: DepBase;

    _setterDep: AsyncSetterDep<V>;
    _model: ModelDep<V>;
    _value: V;
    _setter: ?SetFn;

    constructor(id: DepId, info: Info) {
        this.kind = 'loader'
        this.base = new DepBaseImpl(id, info)
        this._setter = null
    }

    init(setterDep: AsyncSetterDep<V>, model: ModelDep<V>): void {
        this._setterDep = setterDep
        this._model = model
    }

    reset(): void {
        this._setterDep.reset()
        this._setter = null
    }

    resolve(): V {
        if (!this.base.isRecalculate) {
            return this._value
        }

        const setter: SetFn = this._setterDep.resolve();
        if (this._setter !== setter) {
            this._setter = setter
            setter()
        }

        this.base.isRecalculate = false
        this._value = this._model.resolve()
        return this._value
    }
}

// depends on setter
// implements Plugin
export default class LoaderPlugin {
    create<V: Object, E>(annotation: LoaderAnnotation<V, E>, acc: AnnotationResolver): void {
        const {base} = annotation
        const dep: LoaderDepImpl<V> = new LoaderDepImpl(base.id, base.info);
        acc.begin(dep)
        const model: AnyDep = acc.resolve(annotation.model);
        if (model.kind !== 'model') {
            throw new Error(
                `Not an model ${model.base.info.displayName} in ${base.info.displayName}`
            )
        }

        const setterDep: AnyDep = acc.resolveAnnotation(new AsyncSetterAnnotationImpl(
            `${base.id}.setter`,
            annotation.model,
            base.target,
            annotation.deps,
            base.info.tags
        ));
        if (setterDep.kind !== 'asyncsetter') {
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
