/* @flow */

import type {FactoryAnnotation} from 'reactive-di/i/pluginsInterfaces'
import type {
    ArgumentHelper,
    Container,
    Provider
} from 'reactive-di/i/coreInterfaces'

import BaseProvider from 'reactive-di/core/BaseProvider'

class FactoryProvider<V> extends BaseProvider<V, FactoryAnnotation, Provider> {
    kind: 'factory';
    value: V;
    _helper: ArgumentHelper = (null: any);

    init(annotation: FactoryAnnotation, container: Container): void {
        this._helper = container.createArgumentHelper(annotation);
    }

    update(): void {
        this.value = this._helper.invokeFunction()
    }

    addDependency(dependency: Provider): void {
        dependency.addDependant(this)
    }
}

export default class FactoryPlugin {
    kind: 'factory' = 'factory';
    create(annotation: FactoryAnnotation): Provider<any, FactoryAnnotation, Provider> {
        return new FactoryProvider(annotation)
    }
}
