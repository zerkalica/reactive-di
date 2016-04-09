/* @flow */
import type {FactoryAnnotation} from 'reactive-di/i/pluginsInterfaces'
import type {
    Tag,
    Dependency,
    Resolver,
    ResolveDepsResult,
    Context,
    Provider
} from 'reactive-di/i/coreInterfaces'

import {fastCall} from 'reactive-di/utils/fastCall'
import BaseProvider from 'reactive-di/core/BaseProvider'

class FactoryResolver {
    displayName: string;

    _value: any;

    constructor(
        resolver: () => ResolveDepsResult,
        target: Dependency,
        displayName: string
    ) {
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
        this.displayName = displayName
    }

    reset(): void {
    }

    resolve(): any {
        return this._value
    }
}

class FactoryProvider extends BaseProvider<FactoryAnnotation> {
    kind: 'factory';
    displayName: string;
    tags: Array<Tag>;
    annotation: FactoryAnnotation;

    _resolver: () => ResolveDepsResult;

    init(acc: Context): void {
        this._resolver = acc.createDepResolver(
            this.annotation,
            this.tags
        )
    }

    createResolver(): Resolver {
        const annotation = this.annotation

        return new FactoryResolver(
            this._resolver,
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
