/* @flow */
import type {
    Tag,
    DepFn
} from 'reactive-di/i/annotationInterfaces'
import type {FacetAnnotation} from 'reactive-di/i/pluginsInterfaces'
import type {
    Context,
    ResolverCreator,
    Resolver,
    ResolveDepsResult
} from 'reactive-di/i/nodeInterfaces'

import {createFunctionProxy} from 'reactive-di/utils/createProxy'
import {fastCall} from 'reactive-di/utils/fastCall'
import BaseResolverCreator from 'reactive-di/core/BaseResolverCreator'

class FacetResolver {
    displayName: string;

    _isCached: boolean;
    _resolver: () => ResolveDepsResult;
    _target: DepFn;
    _value: any;

    constructor(
        creator: ResolverCreator,
        resolver: () => ResolveDepsResult,
        target: DepFn
    ) {
        this.displayName = creator.displayName
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
        let fn: V;
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

export class FacetResolverCreator extends BaseResolverCreator {
    kind: 'facet';
    displayName: string;
    tags: Array<Tag>;

    _target: DepFn;
    _resolver: () => ResolveDepsResult;

    constructor(annotation: FacetAnnotation) {
        super(annotation)
        this._target = annotation.target
    }

    init(resolver: () => ResolveDepsResult): void {
        this._resolver = resolver
    }

    createResolver(): Resolver {
        return new FacetResolver(
            this,
            this._resolver,
            this._target
        )
    }
}

// implements Plugin
export default class FacetPlugin {
    kind: 'facet' = 'facet';

    create(annotation: FacetAnnotation, acc: Context): ResolverCreator { // eslint-disable-line
        const dep = new FacetResolverCreator(annotation)
        acc.addRelation(dep)
        return dep;
    }

    finalize(dep: FacetResolverCreator, annotation: FacetAnnotation, acc: Context): void {
        dep.init(acc.createDepResolver(annotation, dep.tags))
    }
}
