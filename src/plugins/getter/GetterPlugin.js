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

// implements GetterDep
class GetterDepImpl<V> {
    kind: 'getter';
    base: DepBase<Getter<V>>;

    constructor(
        id: DepId,
        info: Info,
        modelBase: DepBase<V>,
    ) {
        this.kind = 'getter'
        this.base = new DepBaseImpl(id, info)
        this.base.isRecalculate = false

        this.base.value = function getter(): V {
            return modelBase.value
        }
    }

    resolve(): void {
    }
}

// depends on model
// implements Plugin
export default class GetterPlugin {
    create<V>(annotation: GetterAnnotation<V>, acc: AnnotationResolver): void {
        const {base} = annotation
        const modelDep: AnyDep = acc.newRoot().resolve(base.target);
        if (modelDep.kind !== 'model') {
            throw new Error('Not a model dep type: ' + modelDep.kind)
        }

        const dep: GetterDep<V> = new GetterDepImpl(
            base.id,
            base.info,
            modelDep.base
        );

        acc.begin(dep)
        acc.end(dep)
    }

    finalize<V>(dep: GetterDep<V>, target: AnyDep): void {
    }
}
