/* @flow */
import type {
    ValueAnnotation
} from 'reactive-di/i/pluginsInterfaces'
import type {
    Plugin,
    Container,
    ValueProvider as IValueProvider
} from 'reactive-di/i/coreInterfaces'

import BaseProvider from 'reactive-di/core/BaseProvider'

class ValueProvider<V> extends BaseProvider {
    type: 'value' = 'value';
    value: V;

    constructor(
        annotation: ValueAnnotation<V>,
        container: Container,
        value: ?V
    ) {
        super(annotation, container)
        this.value = value || annotation.value
    }

    set(value: V): boolean {
        this.value = value
        return true
    }
}

class ValuePlugin {
    kind: 'value' = 'value';

    createContainer(annotation: ValueAnnotation, container: Container): Container {
        return container
    }

    createProvider(annotation: ValueAnnotation, container: Container, value: any): IValueProvider {
        return new ValueProvider(annotation, container, value)
    }
}

export default function createValuePlugin(): Plugin {
    return new ValuePlugin()
}
