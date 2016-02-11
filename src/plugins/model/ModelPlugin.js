/* @flow */

import modelFinalizer from './modelFinalizer'
import ModelDepImpl from './impl/ModelDepImpl'
import type {Cursor} from '../../interfaces/modelInterfaces'
import type {
    AnyDep,
    AnnotationResolver
} from '../../interfaces/nodeInterfaces'
import type {Plugin} from '../../interfaces/pluginInterfaces' // eslint-disable-line
import type {
    ModelDep,
    ModelAnnotation,
} from './modelInterfaces'

// implements Plugin
export default class ModelPlugin {
    create<V: Object, E>(annotation: ModelAnnotation<V>, acc: AnnotationResolver): void {
        const {base, info} = annotation
        const cursor: Cursor<V> = acc.createCursor(info.statePath);

        const dep: ModelDep<V> = new ModelDepImpl(
            base.id,
            base.info,
            cursor,
            info.fromJS
        );
        acc.addRelation(base.id)

        const {childs} = info
        acc.begin(dep)
        for (let i = 0, l = childs.length; i < l; i++) {
            acc.resolve(childs[i])
        }
        acc.end(dep)
    }

    finalize(dep: ModelDep, child: AnyDep): void {
        modelFinalizer(dep, child)
    }
}
