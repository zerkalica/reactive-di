/* @flow */
import type {
    ValueAnnotation
} from 'reactive-di/i/pluginsInterfaces'
import type {
    ValueProvider as IValueProvider
} from 'reactive-di/i/coreInterfaces'

import BaseProvider from 'reactive-di/core/BaseProvider'

class ValueProvider<V> extends BaseProvider {
    type: 'value' = 'value';
    value: V;

    constructor(annotation: ValueAnnotation<V>) {
        super(annotation)
        this.value = annotation.value
    }

    set(value: V): boolean {
        this.value = value
        return true
    }
}

export default class ValuePlugin {
    kind: 'value' = 'value';
    create(annotation: ValueAnnotation): IValueProvider {
        return new ValueProvider(annotation)
    }
}
