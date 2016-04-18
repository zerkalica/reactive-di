/* @flow */
import type {ValueAnnotation} from 'reactive-di/i/pluginsInterfaces'
import type {
    Provider,
    Collection
} from 'reactive-di/i/coreInterfaces'

import BaseProvider from 'reactive-di/core/BaseProvider'

class ValueProvider extends BaseProvider<ValueAnnotation, Provider> {
    kind: 'value';
    annotation: ValueAnnotation;
    dependants: Collection<Provider>;

    _value: any;

    init(container: Container): void { // eslint-disable-line
        this._value = this.annotation.value
    }

    get(): any {
        return this._value
    }

    set(value: any): boolean {
        this._value = value
        return true
    }
}

export default {
    kind: 'value',
    create(annotation: ValueAnnotation): Provider<ValueAnnotation, Provider> {
        return new ValueProvider(annotation)
    }
}
