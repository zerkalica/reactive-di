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
    annotation: FactoryAnnotation;
    isCached: boolean;

    value: V;
    _helper: ArgumentHelper;

    init(container: Container): void {
        this._helper = container.createArgumentHelper(this.annotation);
    }

    update(): void {
        this.value = this._helper.invokeFunction()
        this.isCached = true
    }
}

export default {
    kind: 'factory',
    create(annotation: FactoryAnnotation): Provider<any, FactoryAnnotation, Provider> {
        return new FactoryProvider(annotation)
    }
}
