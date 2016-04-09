/* @flow */
import type {ValueAnnotation} from 'reactive-di/i/pluginsInterfaces'
import type {
    Tag,
    Resolver,
    Provider
} from 'reactive-di/i/coreInterfaces'

import BaseProvider from 'reactive-di/core/BaseProvider'

class ValueResolver {
    _value: any;

    constructor(value: any) {
        this._value = value
    }

    setValue(value: any): void {
        this._value = value
    }

    reset(): void {
    }

    resolve(): any {
        return this._value
    }
}

export class ValueProvider extends BaseProvider<ValueAnnotation> {
    kind: 'value';
    displayName: string;
    tags: Array<Tag>;
    annotation: ValueAnnotation;

    createResolver(): Resolver {
        return new ValueResolver(this.annotation.value)
    }
}

export default {
    kind: 'value',
    create(annotation: ValueAnnotation): Provider {
        return new ValueProvider(annotation)
    }
}
