/* @flow */
import type {
    Tag,
    DepFn
} from 'reactive-di/i/annotationInterfaces'
import type {FactoryAnnotation} from 'reactive-di/i/pluginsInterfaces'
import type {
    Context,
    Provider,
    Resolver,
    ResolveDepsResult
} from 'reactive-di/i/nodeInterfaces'

import {fastCall} from 'reactive-di/utils/fastCall'
import BaseProvider from 'reactive-di/core/BaseProvider'

class FactoryResolver {
    displayName: string;
    _value: any;

    constructor(
        displayName: string,
        resolver: () => ResolveDepsResult,
        target: DepFn
    ) {
        this.displayName = displayName
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

    canAddToParent(context: Provider): boolean { // eslint-disable-line
        return false
    }

    createResolver(): Resolver {
        return new FactoryResolver(
            this.displayName,
            this._resolver,
            this.annotation.target
        )
    }
}

export default {
    kind: 'factory',
    create(annotation: FactoryAnnotation): Provider<FactoryAnnotation> {
        return new FactoryProvider(annotation)
    }
}
