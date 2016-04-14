/* @flow */
import type {ClassAnnotation} from 'reactive-di/i/pluginsInterfaces'
import type {
    Tag,
    Dependency,
    Resolver,
    Provider,
    Container,
    ResolveDepsResult
} from 'reactive-di/i/coreInterfaces'

import {createObjectProxy} from 'reactive-di/utils/createProxy'
import {fastCreateObject} from 'reactive-di/utils/fastCall'
import BaseProvider from 'reactive-di/core/BaseProvider'

class ClassResolver {
    displayName: string;

    provider: Provider;

    _resolver: () => ResolveDepsResult;
    _target: Dependency;
    _isCached: boolean;
    _value: any;

    constructor(
        provider: Provider,
        resolver: () => ResolveDepsResult,
        target: Dependency,
        displayName: string
    ) {
        this.provider = provider
        this._isCached = false
        this._value = null
        this._target = target
        this._resolver = resolver
        this.displayName = displayName
    }

    reset(): void {
        this._isCached = false
    }

    dispose(): void {}

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

    createResolver(container: Container): Resolver {
        const annotation = this.annotation
        return new ClassResolver(
            this,
            container.createDepResolver(
                annotation,
                this.tags
            ),
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
