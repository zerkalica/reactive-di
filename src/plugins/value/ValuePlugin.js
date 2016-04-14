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
    provider: Provider;

    constructor(
        provider: Provider,
        value: any
    ) {
        this.provider = provider
        this._value = value
    }

    setValue(value: any): void {
        this._value = value
    }

    dispose(): void {}

    reset(): void {}

    resolve(): any {
        return this._value
    }
}

class ValueProvider extends BaseProvider<ValueAnnotation> {
    kind: 'value';
    displayName: string;
    tags: Array<Tag>;
    annotation: ValueAnnotation;

    createResolver(container: Container): Resolver { // eslint-disable-line
        return new ValueResolver(
            this,
            this.annotation.value
        )
    }
}

export default {
    kind: 'value',
    create(annotation: ValueAnnotation): Provider {
        return new ValueProvider(annotation)
    }
}
