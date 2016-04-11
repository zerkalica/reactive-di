/* @flow */
import type {ComposeAnnotation} from 'reactive-di/i/pluginsInterfaces'
import type {
    Tag,
    Dependency,
    Container,
    Resolver,
    Provider,
    ResolveDepsResult
} from 'reactive-di/i/coreInterfaces'

import {fastCall} from 'reactive-di/utils/fastCall'
import BaseProvider from 'reactive-di/core/BaseProvider'

class ComposeResolver {
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

class ComposeProvider extends BaseProvider<ComposeAnnotation> {
    kind: 'compose';
    displayName: string;
    tags: Array<Tag>;
    annotation: ComposeAnnotation;

    _resolver: () => ResolveDepsResult;

    init(acc: Container): void {
        this._resolver = acc.createDepResolver(
            this.annotation,
            this.tags
        )
    }

    createResolver(): Resolver {
        const annotation = this.annotation

        return new ComposeResolver(
            this._resolver,
            annotation.dep || (annotation.target: any),
            this.displayName
        )
    }
}

export default {
    kind: 'compose',
    create(annotation: ComposeAnnotation): Provider<ComposeAnnotation> {
        return new ComposeProvider(annotation)
    }
}
