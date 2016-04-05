/* @flow */
import type {
    Tag,
    DepFn
} from 'reactive-di/i/annotationInterfaces'
import type {ClassAnnotation} from 'reactive-di/i/pluginsInterfaces'
import type {
    Resolver,
    Context,
    ResolverCreator,
    ResolveDepsResult
} from 'reactive-di/i/nodeInterfaces'

import {createObjectProxy} from 'reactive-di/utils/createProxy'
import {fastCreateObject} from 'reactive-di/utils/fastCall'
import BaseResolverCreator from 'reactive-di/core/BaseResolverCreator'

class ClassResolver<V: Object> {
    displayName: string;

    _isCached: boolean;
    _resolver: () => ResolveDepsResult;
    _target: Class<V>;
    _value: any;

    constructor(
        creator: ResolverCreator,
        resolver: () => ResolveDepsResult,
        target: Class<V>
    ) {
        this.displayName = creator.displayName
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

export class ClassResolverCreator<V: Object> extends BaseResolverCreator {
    kind: 'klass';
    displayName: string;
    tags: Array<Tag>;

    _target: DepFn<V>;
    _resolver: () => ResolveDepsResult;

    constructor(annotation: ClassAnnotation) {
        super(annotation)
        this._target = annotation.target
    }

    init(resolver: () => ResolveDepsResult): void {
        this._resolver = resolver
    }

    createResolver(): Resolver {
        return new ClassResolver(
            this,
            this._resolver,
            this._target
        )
    }
}

// implements Plugin
export default class ClassPlugin {
    kind: 'klass' = 'klass';

    create(annotation: ClassAnnotation, acc: Context): ResolverCreator { // eslint-disable-line
        const dep = new ClassResolverCreator(annotation)
        acc.addRelation(dep)
        return dep;
    }

    finalize(dep: ClassResolverCreator, annotation: ClassAnnotation, acc: Context): void {
        dep.init(acc.createDepResolver(annotation, dep.tags))
    }
}
