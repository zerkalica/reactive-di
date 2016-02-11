/* @flow */

import {DepBaseImpl} from '../../core/pluginImpls'
import type {
    DepId,
    Info
} from '../../interfaces/annotationInterfaces'
import type {
    AnyDep,
    DepBase,
    AnnotationResolver
} from '../../interfaces/nodeInterfaces'
import type {Plugin} from '../../interfaces/pluginInterfaces' // eslint-disable-line
import type {AsyncModelDep} from '../asyncmodel/asyncmodelInterfaces'
import type {ModelDep} from '../model/modelInterfaces'
import type {
    Getter,
    GetterDep,
    GetterAnnotation
} from './getterInterfaces'

type AnyModelDep<V, E> = ModelDep<V>|AsyncModelDep<V, E>;
type Resolvable<V> = {
    resolve: () => V;
};

// implements GetterDep
class GetterDepImpl<V: Object> {
    kind: 'getter';
    base: DepBase;
    _model: Resolvable<V>;
    _value: Getter<V>;

    constructor(
        id: DepId,
        info: Info,
        model: Resolvable<V>
    ) {
        this.kind = 'getter'
        this.base = new DepBaseImpl(id, info)
        this._model = model
        this._value = function getter(): V {
            return model.resolve()
        }
    }

    resolve(): Getter<V> {
        return this._value
    }
}

// depends on model, asyncmodel
// implements Plugin
export default class GetterPlugin {
    create<V: Object, E>(annotation: GetterAnnotation<V>, acc: AnnotationResolver): void {
        const {base} = annotation
        const modelDep: AnyModelDep<V, E> = (acc.newRoot().resolve(base.target): any);
        if (modelDep.kind !== 'model' && modelDep.kind !== 'asyncmodel') {
            throw new Error(
                `Not a model dep type: ${modelDep.kind} in ${modelDep.base.info.displayName}`
            )
        }

        const dep: GetterDep<V> = new GetterDepImpl(
            base.id,
            base.info,
            (modelDep: Resolvable<V>)
        );

        acc.begin(dep)
        acc.end(dep)
    }

    finalize<V: Object, E>(dep: GetterDep<V>, target: AnyDep): void {} // eslint-disable-line
}
