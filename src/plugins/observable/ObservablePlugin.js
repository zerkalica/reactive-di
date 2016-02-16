/* @flow */
/* eslint-disable no-undef */
import FactoryAnnotationImpl from '../factory/FactoryAnnotationImpl'
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
import type {FactoryDep} from '../factory/factoryInterfaces'
import type {
    ObservableDep,
    ObservableAnnotation
} from './observableInterfaces'

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
// implements RdiPlugin
export default class ObservablePlugin {
    create<V, E>(annotation: ObservableAnnotation<V>, acc: AnnotationResolver): void {
        const {base} = annotation

        const factoryDep: AnyDep = acc.newRoot().resolveAnnotation(new FactoryAnnotationImpl(
            `${base.id}.factory`,
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

    finalize(): void {}
}
