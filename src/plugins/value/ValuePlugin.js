/* @flow */
import type {
    Tag
} from 'reactive-di/i/annotationInterfaces'
import type {ValueAnnotation} from 'reactive-di/i/pluginsInterfaces'
import type {
    Context,
    Resolver,
    ResolverCreator
} from 'reactive-di/i/nodeInterfaces'

import BaseResolverCreator from 'reactive-di/core/BaseResolverCreator'

class ValueResolver {
    displayName: string;
    _value: any;

    constructor(
        creator: ResolverCreator,
        value: any
    ) {
        this.displayName = creator.displayName
        this._value = value
    }

    reset(): void {
    }

    resolve(): any {
        return this._value
    }
}

export class ValueResolverCreator<V: any> extends BaseResolverCreator {
    kind: 'value';
    displayName: string;
    tags: Array<Tag>;

    _value: V;

    constructor(annotation: ValueAnnotation) {
        super(annotation)
        this._value = annotation.value
    }

    createResolver(): Resolver {
        return new ValueResolver(
            this,
            this._value
        )
    }
}

// implements Plugin
export default class ValuePlugin {
    kind: 'value' = 'value';

    create(annotation: ValueAnnotation, acc: Context): ResolverCreator { // eslint-disable-line
        const dep = new ValueResolverCreator(annotation)
        acc.addRelation(dep)
        return dep
    }

    finalize(dep: ValueResolverCreator, annotation: ValueAnnotation, acc: Context): void { // eslint-disable-line
    }
}
