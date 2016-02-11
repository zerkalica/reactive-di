/* @flow */

import modelFinalizer from '../model/modelFinalizer'
import AsyncModelDepImpl from './impl/AsyncModelDepImpl'
import type {
    AnyDep,
    AnnotationResolver
} from '../../interfaces/nodeInterfaces'
import type {Plugin} from '../../interfaces/pluginInterfaces' // eslint-disable-line
import type {
    AsyncModelDep,
    AsyncModelAnnotation
} from './asyncmodelInterfaces'

// depends on factory
// implements Plugin
export default class AsyncModelPlugin {
    create<V: Object, E>(
        annotation: AsyncModelAnnotation<V>,
        acc: AnnotationResolver
    ): void {
        const {base, info} = annotation

        const dep: AsyncModelDep<V, E> = new AsyncModelDepImpl(
            base.id,
            base.info,
            acc.createCursor(info.statePath),
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

    finalize(dep: AsyncModelDep, child: AnyDep): void {
        modelFinalizer(dep, child)
    }
}
