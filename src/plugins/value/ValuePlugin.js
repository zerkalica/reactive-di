/* @flow */
import type {
    Tag
} from 'reactive-di/i/annotationInterfaces'
import type {ValueAnnotation} from 'reactive-di/i/pluginsInterfaces'
import type {
    Resolver,
    Provider
} from 'reactive-di/i/nodeInterfaces'

import BaseProvider from 'reactive-di/core/BaseProvider'

class ValueResolver {
    displayName: string;
    _value: any;

    constructor(
        displayName: string,
        value: any
    ) {
        this.displayName = displayName
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
        return new ValueResolver(
            this.displayName,
            this.annotation.value
        )
    }
}

export default {
    kind: 'value',
    create(annotation: ValueAnnotation): Provider<ValueAnnotation> {
        return new ValueProvider(annotation)
    }
}
