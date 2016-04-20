/* @flow */
import type {
    ValueAnnotation,
    ValueProvider as IValueProvider
} from 'reactive-di/i/pluginsInterfaces'
import type {
    Provider
} from 'reactive-di/i/coreInterfaces'

import BaseProvider from 'reactive-di/core/BaseProvider'

class ValueProvider<V> extends BaseProvider<V, ValueAnnotation, Provider> {
    kind: 'value';
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

export default {
    kind: 'value',
    create(annotation: ValueAnnotation): IValueProvider<any> {
        return new ValueProvider(annotation)
    }
}
