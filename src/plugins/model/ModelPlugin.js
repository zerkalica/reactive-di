/* @flow */

import ModelDepImpl from './impl/ModelDepImpl'
import EntityMetaImpl, {updateMeta} from '../model/EntityMetaImpl'
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
    FactoryDep
} from '../factory/factoryInterfaces'
import type {
    AsyncUpdater,
    EntityMeta
} from '../model/modelInterfaces'
import type {
    ModelDep,
    ModelAnnotation,
    AsyncModelAnnotation
} from './modelInterfaces'

// depends on factory
// implements Plugin
export default class ModelPlugin {
    create<V: Object, E>(
        annotation: ModelAnnotation<V>|AsyncModelAnnotation<V, E>,
        acc: AnnotationResolver
    ): void {
        const {base, info} = annotation
        const cursor: Cursor<V> = acc.createCursor(info.statePath);

        const loader: ?FactoryDep<Observable<V, E>> = annotation.loader
            ? (acc.newRoot().resolve(annotation.loader, acc): any)
            : null;

        const dep: ModelDep<V, E> = new ModelDepImpl(
            base.id,
            base.info,
            cursor,
            info.fromJS,
            acc.notify,
            annotation.kind === 'asyncmodel',
            loader
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
        const {base} = dep
        switch (child.kind) {
            case 'model':
                const {base: childBase, dataOwners: childOwners} = child
                dep.dataOwners.push(childBase)
                childOwners.push((base: Cacheable))
                childBase.relations.push(base.id)
                break
            default:
                throw new TypeError('Unhandlered dep type: ' + child.kind)
        }
    }
}
