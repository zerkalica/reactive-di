/* @flow */
import type {
    Tag,
    DepFn
} from 'reactive-di/i/annotationInterfaces'
import type {FactoryAnnotation} from 'reactive-di/i/pluginsInterfaces'
import type {
    Context,
    Resolver,
    ResolverCreator,
    ResolveDepsResult
} from 'reactive-di/i/nodeInterfaces'

import {createFunctionProxy} from 'reactive-di/utils/createProxy'
import {fastCall} from 'reactive-di/utils/fastCall'
import BaseResolverCreator from 'reactive-di/core/BaseResolverCreator'

class FactoryResolver {
    displayName: string;
    _value: any;

    constructor(
        creator: ResolverCreator,
        resolver: () => ResolveDepsResult,
        target: DepFn
    ) {
        this.displayName = creator.displayName
        this._value = function getValue(...args: Array<any>): any {
            const {deps, middlewares} = resolver()
            const props = deps.concat(args)
            const result = fastCall(target, props);
            if (middlewares) {
                const middlewareProps = [result].concat(props)
                for (let i = 0, l = middlewares.length; i < l; i++) {
                    fastCall(middlewares[i], middlewareProps)
                }
            }
            return result
        }
    }

    reset(): void {
    }

    resolve(): any {
        return this._value
    }
}

class FactoryResolverCreator extends BaseResolverCreator {
    kind: 'factory';
    displayName: string;
    tags: Array<Tag>;
    target: Dependency;

    _resolver: () => ResolveDepsResult;

    constructor(annotation: FactoryAnnotation) {
        super(annotation)
    }

    init(resolver: () => ResolveDepsResult): void {
        this._resolver = resolver
    }

    createResolver(): Resolver {
        return new FactoryResolver(
            this,
            this._resolver,
            this.target
        )
    }
}

// implements Plugin
export default class FactoryPlugin {
    kind: 'factory' = 'factory';

    create(annotation: FactoryAnnotation, acc: Context): ResolverCreator { // eslint-disable-line
        const dep = new FactoryResolverCreator(annotation);
        return dep
    }

    finalize(dep: FactoryResolverCreator, annotation: FactoryAnnotation, acc: Context): void {
        dep.init(acc.createDepResolver(annotation, dep.tags))
    }
}
