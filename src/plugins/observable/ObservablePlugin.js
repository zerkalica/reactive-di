/* @flow */

import merge from '../../utils/merge'
import FactoryAnnotationImpl from '../factory/FactoryAnnotationImpl'
import {DepBaseImpl} from '../../core/pluginImpls'
import type {
    DepId,
    Info
} from '../../interfaces/annotationInterfaces'
import type {
    AnyDep,
    DepBase,
    AnnotationResolver,
    ListenerManager
} from '../../interfaces/nodeInterfaces'
import type {StatefullObservable} from '../../interfaces/observableInterfaces'
import type {Plugin} from '../../interfaces/pluginInterfaces'
import type {
    ObservableDep,
    ObservableAnnotation
} from './observableInterfaces'

import type {
    Subscription,
    Observable,
    SubscriptionObserver
} from '../../interfaces/observableInterfaces'

import type {
    FactoryDep
} from '../factory/factoryInterfaces'
// eslint-disable-line

// implements ObservableDep
class ObservableDepImpl<V, E> {
    kind: 'observable';
    base: DepBase;
    _observable: Observable<V, E>;
    _factory: FactoryDep<V>;

    constructor(
        id: DepId,
        info: Info,
        observable: Observable<V, E>,
        factory: FactoryDep<V>
    ) {
        this.kind = 'observable'
        this.base = new DepBaseImpl(id, info)
        this._observable = observable
        this._factory = factory
    }

    resolve(): StatefullObservable<V, E> {
        return {
            initialData: this._factory.resolve(),
            observable: this._observable
        }
    }
}

// depends on factory
// implements Plugin
export default class ObservablePlugin {
    create<V, E>(annotation: ObservableAnnotation<V>, acc: AnnotationResolver): void {
        const {base} = annotation

        const factoryDep: AnyDep = acc.resolveAnnotation(new FactoryAnnotationImpl(
            base.id,
            base.target,
            annotation.deps,
            base.info.tags
        ));
        if (factoryDep.kind !== 'factory') {
            throw new Error(
                `Not a factory: ${factoryDep.base.info.displayName} in ${base.info.displayName}`
            )
        }
        const observable: Observable<V, E> = acc.listeners.add(factoryDep);

        const dep: ObservableDep<V, E> = new ObservableDepImpl(
            base.id,
            base.info,
            observable,
            factoryDep
        );
        acc.begin(dep)
        acc.end(dep)
    }

    finalize<E>(dep: ObservableDep<E>, target: AnyDep): void {
    }
}
