/* @flow */
import type {ClassAnnotation} from 'reactive-di/i/pluginsInterfaces'
import type {
    Tag,
    Dependency,
    Resolver,
    Provider,
    Context,
    ResolveDepsResult
} from 'reactive-di/i/coreInterfaces'

import {createObjectProxy} from 'reactive-di/utils/createProxy'
import {fastCreateObject} from 'reactive-di/utils/fastCall'
import BaseProvider from 'reactive-di/core/BaseProvider'

class ClassResolver {
    displayName: string;

    _resolver: () => ResolveDepsResult;
    _target: Dependency;
    _isCached: boolean;
    _value: any;

    constructor(
        resolver: () => ResolveDepsResult,
        target: Dependency,
        displayName: string
    ) {
        this._isCached = false
        this._value = null
        this._target = target
        this._resolver = resolver
        this.displayName = displayName
    }

    reset(): void {
        this._isCached = false
    }

    resolve(): any {
        if (this._isCached) {
            return this._value
        }
        const {deps, middlewares} = this._resolver()
        let object: any;
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
        const annotation = this.annotation

        return new ClassResolver(
            this._resolver,
            annotation.dep || (annotation.target: any),
            this.displayName
        )
    }
}

export default {
    kind: 'klass',
    create(annotation: ClassAnnotation): Provider<ClassAnnotation> {
        return new ClassProvider(annotation)
    }
}
