/* @flow */
import type {
    Tag
} from 'reactive-di/i/annotationInterfaces'
import type {ValueAnnotation} from 'reactive-di/i/pluginsInterfaces'
import type {
    Provider
} from 'reactive-di/i/nodeInterfaces'

import BaseProvider from 'reactive-di/core/BaseProvider'

export class ValueProvider extends BaseProvider<ValueAnnotation> {
    kind: 'value';
    displayName: string;
    tags: Array<Tag>;
    annotation: ValueAnnotation;

    reset(): void {
    }

    resolve(): any {
        return this.annotation.value
    }
}

export default {
    kind: 'value',
    create(annotation: ValueAnnotation): Provider<ValueAnnotation> {
        return new ValueProvider(annotation)
    }
}
