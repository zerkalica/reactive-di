/* @flow */

import modelFinalizer from 'reactive-di/plugins/model/modelFinalizer'
import ModelDepImpl from 'reactive-di/plugins/model/impl/ModelDepImpl'
import type {Cursor} from 'reactive-di/i/modelInterfaces'
import type {
    AnyDep,
    AnnotationResolver
} from 'reactive-di/i/nodeInterfaces'
import type {Plugin} from 'reactive-di/i/pluginInterfaces' // eslint-disable-line
import type {
    ModelDep,
    ModelAnnotation,
} from 'reactive-di/i/plugins/modelInterfaces'

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
