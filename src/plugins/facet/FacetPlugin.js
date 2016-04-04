/* @flow */
import type {
    Tag,
    DepFn
} from 'reactive-di/i/annotationInterfaces'
import type {FacetAnnotation} from 'reactive-di/i/pluginsInterfaces'
import type {
    Context,
    ResolvableDep,
    ResolveDepsResult
} from 'reactive-di/i/nodeInterfaces'

import {createFunctionProxy} from 'reactive-di/utils/createProxy'
import {fastCall} from 'reactive-di/utils/fastCall'
import getFunctionName from 'reactive-di/utils/getFunctionName'

export class FacetDep<V: any> {
    kind: 'facet';
    displayName: string;
    tags: Array<Tag>;
    isRecalculate: boolean;

    _value: V;
    _target: DepFn<V>;
    _resolver: () => ResolveDepsResult;

    constructor(annotation: FacetAnnotation) {
        this.kind = 'facet'
        const fnName: string = getFunctionName(annotation.target);
        this.displayName = this.kind + '@' + fnName
        this.tags = [this.kind, fnName]

        this._target = annotation.target
    }

    init(resolver: () => ResolveDepsResult): void {
        this._resolver = resolver
    }

    resolve(): V {
        if (!this.isRecalculate) {
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
        this.isRecalculate = false

        return this._value
    }
}

// depends on meta
// implements Plugin
export default class FacetPlugin {
    kind: 'facet' = 'facet';

    create(annotation: FacetAnnotation, acc: Context): ResolvableDep { // eslint-disable-line
        return new FacetDep(annotation);
    }

    finalize(dep: FacetDep, annotation: FacetAnnotation, acc: Context): void {
        dep.init(acc.createDepResolver(annotation, dep.tags))
    }
}
