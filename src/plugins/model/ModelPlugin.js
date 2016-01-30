/* @flow */

import ModelDepImpl from './impl/ModelDepImpl'
import EntityMetaImpl, {updateMeta} from '../model/EntityMetaImpl'
import type {
    DepId,
    Info
} from '../../interfaces/annotationInterfaces'
import {DepBaseImpl} from '../../core/pluginImpls'
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
    resolve<V: Object, E>(dep: ModelDep<V, E>): void {
        const {base, updater, loader} = dep
        if (updater && loader && !updater.isSubscribed) {
            loader.base.resolve()
            updater.subscribe((loader.base.value: Observable<V, E>))
        }
        base.isRecalculate = false
        base.value = dep.get()
    }

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
        acc.begin(dep)
        const {childs} = info
        for (let i = 0, l = childs.length; i < l; i++) {
            acc.resolve(childs[i])
        }
        acc.end(dep)
    }

    finalize(dep: ModelDep, target: AnyDep): void {
        const {base} = dep
        switch (target.kind) {
            case 'model':
                target.dataOwners.push((base: Cacheable))
                break
            default:
                throw new TypeError('Unhandlered dep type: ' + target.kind)
        }
    }
}