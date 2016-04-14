/* @flow */
import type {FactoryAnnotation} from 'reactive-di/i/pluginsInterfaces'
import type {
    Tag,
    Dependency,
    Resolver,
    ResolveDepsResult,
    Container,
    Provider
} from 'reactive-di/i/coreInterfaces'

import {fastCall} from 'reactive-di/utils/fastCall'
import BaseProvider from 'reactive-di/core/BaseProvider'
import {createFunctionProxy} from 'reactive-di/utils/createProxy'

class FactoryResolver {
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
        let fn: any;
        fn = fastCall(this._target, deps);
        if (middlewares) {
            if (typeof fn !== 'function') {
                throw new Error(`No callable returns from ${this.displayName}`)
            }
            fn = createFunctionProxy(fn, middlewares)
        }
        this._value = fn
        this._isCached = true

        return this._value
    }
}

class FactoryProvider extends BaseProvider<FactoryAnnotation> {
    kind: 'factory';
    displayName: string;
    tags: Array<Tag>;
    annotation: FactoryAnnotation;

    createResolver(container: Container): Resolver {
        const annotation = this.annotation

        return new FactoryResolver(
            this,
            container.createDepResolver(
                this.annotation,
                this.tags
            ),
            annotation.dep || (annotation.target: any),
            this.displayName
        )
    }
}

export default {
    kind: 'factory',
    create(annotation: FactoryAnnotation): Provider<FactoryAnnotation> {
        return new FactoryProvider(annotation)
    }
}
