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

function getObservableParams<V: Object>(value: V): V {
    return value
}

// implements ObservableDep
class ObservableDepImpl<V: Object, E> {
    kind: 'observable';
    base: DepBase;
    _observable: Observable<V, E>;
    _factory: FactoryDep<V>;

    constructor(
        annotation: ObservableAnnotation<V>,
        factory: FactoryDep<V>,
        observable: Observable<V, E>
    ) {
        this.kind = 'observable'
        this.base = new DepBaseImpl({
            kind: annotation.kind,
            id: annotation.id,
            target: getObservableParams
        })
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
    create<V: Object, E>(annotation: ObservableAnnotation<V>, acc: AnnotationResolver): void {
        const id = annotation.id = acc.createId(); // eslint-disable-line
        const factoryAnnotation: FactoryAnnotation<V> = {
            kind: 'factory',
            id: id + '.factory',
            target: getObservableParams,
            deps: [annotation.target]
        };
        const factoryDep: FactoryDep<V> = acc.newRoot().resolveAnnotation(factoryAnnotation);
        if (factoryDep.kind !== 'factory') {
            throw new Error(
                `Not a factory: ${factoryDep.base.displayName} in ${annotation.kind}`
            )
        }
        const observable: Observable<V, E> = acc.listeners.add(factoryDep);

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
