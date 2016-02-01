/* @flow */
import type {
    DepFn,
    DepId,
    Info
} from '../../interfaces/annotationInterfaces'
import {DepBaseImpl} from '../../core/pluginImpls'
import type {
    AnyDep,
    DepBase,
    AnnotationResolver
} from '../../interfaces/nodeInterfaces'
import type {Plugin} from '../../interfaces/pluginInterfaces'
import type {
    Getter,
    GetterDep,
    GetterAnnotation
} from './getterInterfaces'
import type {ModelDep} from '../model/modelInterfaces'

// implements GetterDep
class GetterDepImpl<V: Object, E> {
    kind: 'getter';
    base: DepBase;
    _model: ModelDep<V, E>;
    _value: Getter<V>;

    constructor(
        id: DepId,
        info: Info,
        model: ModelDep<V, E>
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

// depends on model
// implements Plugin
export default class GetterPlugin {
    create<V: Object, E>(annotation: GetterAnnotation<V>, acc: AnnotationResolver): void {
        const {base} = annotation
        const modelDep: AnyDep = acc.newRoot().resolve(base.target);
        if (modelDep.kind !== 'model') {
            throw new Error('Not a model dep type: ' + modelDep.kind)
        }

        const dep: GetterDep<V, E> = new GetterDepImpl(
            base.id,
            base.info,
            modelDep
        );

        acc.begin(dep)
        acc.end(dep)
    }

    finalize<V: Object, E>(dep: GetterDep<V, E>, target: AnyDep): void {}
}
