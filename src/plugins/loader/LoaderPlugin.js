/* @flow */

import defaultFinalizer from 'reactive-di/pluginsCommon/defaultFinalizer'
import {DepBaseImpl} from 'reactive-di/pluginsCommon/pluginImpls'
import type {
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
import type {AsyncSetterAnnotation} from 'reactive-di/i/plugins/setterInterfaces'

// implements LoaderDep
class LoaderDepImpl<V: Object> {
    kind: 'loader';
    base: DepBase;

    _setterDep: AsyncSetterDep<V>;
    _model: ModelDep<V>;
    _value: V;
    _setter: ?SetFn;

    constructor<E>(annotation: LoaderAnnotation<V, E>) {
        this.kind = 'loader'
        this.base = new DepBaseImpl(annotation)
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
    kind: 'loader' = 'loader';

    create<V: Object, E>(annotation: LoaderAnnotation<V, E>, acc: AnnotationResolver): void {
        const id = annotation.id = acc.createId() // eslint-disable-line
        const dep: LoaderDepImpl<V> = new LoaderDepImpl(annotation);
        acc.begin(dep)
        const model: ModelDep = acc.resolve(annotation.model);
        if (model.kind !== 'model') {
            throw new Error(
                `Not an model ${model.base.displayName} in ${dep.base.displayName}`
            )
        }

        const asyncSetterAnnotation: AsyncSetterAnnotation<V, E> = {
            kind: 'asyncsetter',
            id: model.base.id + '.asyncsetter',
            model: annotation.model,
            deps: annotation.deps,
            target: annotation.target
        };

        const setterDep: AsyncSetterDep = acc.resolveAnnotation(asyncSetterAnnotation);
        if (setterDep.kind !== 'asyncsetter') {
            throw new Error(
                `Not a setter: ${setterDep.base.displayName} in ${dep.base.displayName}`
            )
        }

        dep.init(setterDep, model)

        acc.end(dep)
    }

    finalize<Dep: Object>(dep: LoaderDep, target: Dep): void {
        defaultFinalizer(dep.base, target)
    }
}
