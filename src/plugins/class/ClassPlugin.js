/* @flow */
import type {
    Tag
} from 'reactive-di/i/annotationInterfaces'
import type {ClassAnnotation} from 'reactive-di/i/pluginsInterfaces'
import type {
    Provider,
    Resolver,
    Context,
    ResolveDepsResult
} from 'reactive-di/i/nodeInterfaces'

import {createObjectProxy} from 'reactive-di/utils/createProxy'
import {fastCreateObject} from 'reactive-di/utils/fastCall'
import BaseProvider from 'reactive-di/core/BaseProvider'

class ClassResolver<V: Object> {
    displayName: string;

    _isCached: boolean;
    _resolver: () => ResolveDepsResult;
    _target: Class<V>;
    _value: any;

    constructor(
        displayName: string,
        resolver: () => ResolveDepsResult,
        target: Class<V>
    ) {
        this.displayName = displayName
        this._isCached = false
        this._resolver = resolver
        this._target = target
    }

    reset(): void {
        this._isCached = false
    }

    resolve(): V {
        if (this._isCached) {
            return this._value
        }
        const {deps, middlewares} = this._resolver()
        let object: V;
        object = fastCreateObject(this._target, deps);
        if (middlewares) {
            if (typeof object !== 'object') {
                throw new Error(`No object returns from ${this.displayName}`)
            }
            object = createObjectProxy(object, middlewares)
        }
        this._value = object
        this._isCached = true

        return this._value
    }
}

class ClassProvider extends BaseProvider<ClassAnnotation> {
    kind: 'klass';
    displayName: string;
    tags: Array<Tag>;
    annotation: ClassAnnotation;

    _resolver: () => ResolveDepsResult;

    init(acc: Context): void {
        this._resolver = acc.createDepResolver(
            this.annotation,
            this.tags
        )
    }

    createResolver(): Resolver {
        return new ClassResolver(
            this.displayName,
            this._resolver,
            this.annotation.target
        )
    }
}

export default {
    kind: 'klass',
    create(annotation: ClassAnnotation): Provider<ClassAnnotation> {
        return new ClassProvider(annotation)
    }
}
