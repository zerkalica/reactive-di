/* @flow */
import type {
    ValueAnnotation,
    Container,
    PassiveProvider,
    CreateContainerManager
} from 'reactive-di'

import BaseProvider from 'reactive-di/core/BaseProvider'

class ValueProvider<V> extends BaseProvider {
    type: 'passive' = 'passive';
    value: V;

    constructor(
        annotation: ValueAnnotation<V>,
        container: Container,
        value: ?V
    ) {
        super(annotation, container)
        this.value = value || annotation.value
    }
}

export default class ValuePlugin {
    kind: 'value' = 'value';
    createContainerManager: CreateContainerManager;

    createProvider(annotation: ValueAnnotation, container: Container, value: any): PassiveProvider {
        return new ValueProvider(annotation, container, value)
    }
}
