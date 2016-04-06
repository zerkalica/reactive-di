/* @flow */
import type {
    Tag,
    DepFn
} from 'reactive-di/i/annotationInterfaces'
import type {FacetAnnotation} from 'reactive-di/i/pluginsInterfaces'
import type {
    Context,
    Provider,
    Resolver,
    ResolveDepsResult
} from 'reactive-di/i/nodeInterfaces'

import {createFunctionProxy} from 'reactive-di/utils/createProxy'
import {fastCall} from 'reactive-di/utils/fastCall'
import BaseProvider from 'reactive-di/core/BaseProvider'

class FacetResolver {
    displayName: string;

    _isCached: boolean;
    _resolver: () => ResolveDepsResult;
    _target: DepFn;
    _value: any;

    constructor(
        displayName: string,
        resolver: () => ResolveDepsResult,
        target: DepFn
    ) {
        this.displayName = displayName
        this._isCached = false
        this._resolver = resolver
        this._target = target
    }

    reset(): void {
        this._isCached = false
    }

    resolve():any {
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

class FacetProvider extends BaseProvider {
    kind: 'facet';
    displayName: string;
    tags: Array<Tag>;
    annotation: FacetAnnotation;

    _resolver: () => ResolveDepsResult;

    init(acc: Context): void {
        this._resolver = acc.createDepResolver(
            this.annotation,
            this.tags
        )
    }

    createResolver(): Resolver {
        return new FacetResolver(
            this.displayName,
            this._resolver,
            this.annotation.target
        )
    }
}

export default {
    kind: 'facet',
    create(annotation: FacetAnnotation): Provider<FacetAnnotation> {
        return new FacetProvider(annotation)
    }
}
