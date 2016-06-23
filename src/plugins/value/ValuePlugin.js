/* @flow */
import type {
    ValueAnnotation,
    Container,
    PassiveProvider,
    CreateContainerManager
} from 'reactive-di'

import BaseProvider from 'reactive-di/core/BaseProvider'

class ValueProvider extends BaseProvider {
    type: 'passive' = 'passive';
    value: mixed;

    constructor(
        annotation: ValueAnnotation,
        container: Container,
        key: DependencyKey
    ) {
        super(annotation, container)
        this.value = container.initState.get(annotation.key || key) || annotation.value
    }
}

export default class ValuePlugin {
    kind: 'value' = 'value';
    createContainerManager: CreateContainerManager;

    createProvider(
        annotation: ValueAnnotation,
        container: Container,
        key: DependencyKey
    ): PassiveProvider {
        return new ValueProvider(annotation, container, key)
    }
}
