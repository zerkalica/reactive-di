/* @flow */

import modelFinalizer from '../model/modelFinalizer'
import AsyncModelDepImpl from './impl/AsyncModelDepImpl'
import EntityMetaImpl, {updateMeta} from './EntityMetaImpl'
import {DepBaseImpl} from '../../core/pluginImpls'
import type {
    DepId,
    Info
} from '../../interfaces/annotationInterfaces'
import type {
    Cursor
} from '../../interfaces/modelInterfaces'
import type {
    AnyDep,
    DepBase,
    AnnotationResolver,
    Cacheable
} from '../../interfaces/nodeInterfaces'
import type {
    Observable,
    Subscription
} from '../../interfaces/observableInterfaces'
import type {Plugin} from '../../interfaces/pluginInterfaces'
import type {
    EntityMeta,
    AsyncModelDep,
    AsyncModelAnnotation
} from './asyncmodelInterfaces'

// depends on factory
// implements Plugin
export default class AsyncModelPlugin {
    create<V: Object, E>(
        annotation: AsyncModelAnnotation<V, E>,
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
