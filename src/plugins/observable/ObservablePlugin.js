/* @flow */
import {DepBaseImpl} from 'reactive-di/pluginsCommon/pluginImpls'
import type {
    DepBase,
    AnnotationResolver
} from 'reactive-di/i/nodeInterfaces'
import type {FactoryDep} from 'reactive-di/i/plugins/factoryInterfaces'
import type {
    ObservableDep,
    ObservableAnnotation
} from 'reactive-di/i/plugins/observableInterfaces'
import type {StatefullObservable} from 'reactive-di/i/statefullObservable'
import type {
    FactoryAnnotation
} from 'reactive-di/i/plugins/factoryInterfaces'

// implements ObservableDep
class ObservableDepImpl<V: Object, E> {
    kind: 'observable';
    base: DepBase;
    _value: StatefullObservable<V, E>;

    constructor(
        annotation: ObservableAnnotation<V>,
        factory: FactoryDep<V>,
        observable: Observable<V, E>
    ) {
        this.kind = 'observable'
        this.base = new DepBaseImpl(annotation)
        this._value = {
            get(): V {
                return factory.resolve()
            },
            observable
        }
    }

    resolve(): StatefullObservable<V, E> {
        return this._value
    }
}

// depends on factory
// implements RdiPlugin
export default class ObservablePlugin {
    kind: 'observable' = 'observable';
    create<V: Object, E>(annotation: ObservableAnnotation<V>, acc: AnnotationResolver): void {
        const id = annotation.id = acc.createId(); // eslint-disable-line
        const factoryAnnotation: FactoryAnnotation<V> = {
            kind: 'factory',
            id: id + '.factory',
            target: annotation.target,
            deps: annotation.deps ? [annotation.deps] : []
        };

        const factoryDep: FactoryDep<V> = acc.newRoot().resolveAnnotation(factoryAnnotation);
        if (factoryDep.kind !== 'factory') {
            throw new Error(
                `Not a factory: ${factoryDep.base.displayName} in ${annotation.kind}`
            )
        }
        const observable: Observable<V, E> = acc.listeners.add(factoryDep);
        (observable: any).displayName = 'observable@' + factoryDep.base.displayName
        const dep: ObservableDep<V, E> = new ObservableDepImpl(
            annotation,
            factoryDep,
            observable
        );
        acc.begin(dep)
        acc.end(dep)
    }

    finalize(dep: ObservableAnnotation, target: Object): void {} // eslint-disable-line
}
