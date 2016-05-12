/* @flow */

import type {
    FactoryAnnotation,
    ArgumentHelper,
    Container,
    PassiveProvider,
    Plugin
} from 'reactive-di'

import BaseProvider from 'reactive-di/core/BaseProvider'

class FactoryProvider<V> extends BaseProvider {
    type: 'passive' = 'passive';
    value: V;
    _helper: ArgumentHelper;

    constructor(annotation: FactoryAnnotation, container: Container) {
        super(annotation, container)
        this._helper = container.createArgumentHelper(annotation)
    }

    update(): void {
        this.value = this._helper.invokeFunction()
    }
}

class FactoryPlugin {
    kind: 'factory' = 'factory';

    createProvider(annotation: FactoryAnnotation, container: Container): PassiveProvider {
        return new FactoryProvider(annotation, container)
    }
}

export default function createFactoryPlugin(): Plugin {
    return new FactoryPlugin()
}
