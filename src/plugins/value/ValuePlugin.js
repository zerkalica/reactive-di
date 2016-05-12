/* @flow */
import type {
    ValueAnnotation,
    Plugin,
    Container,
    PassiveProvider
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

class ValuePlugin {
    kind: 'value' = 'value';

    createProvider(annotation: ValueAnnotation, container: Container, value: any): PassiveProvider {
        return new ValueProvider(annotation, container, value)
    }
}

export default function createValuePlugin(): Plugin {
    return new ValuePlugin()
}
