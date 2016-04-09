/* @flow */
import type {AliasAnnotation} from 'reactive-di/i/pluginsInterfaces'
import type {
    Tag,
    Container,
    Provider,
    Resolver
} from 'reactive-di/i/coreInterfaces'

import BaseProvider from 'reactive-di/core/BaseProvider'

class AliasResolver {
    _resolver: Resolver;

    constructor(resolver: Resolver) {
        this._resolver = resolver
    }

    reset(): void {
        this._resolver.reset()
    }

    resolve(): any {
        return this._resolver.resolve()
    }
}

class AliasProvider extends BaseProvider<AliasAnnotation> {
    kind: 'alias';
    displayName: string;
    tags: Array<Tag>;
    annotation: AliasAnnotation;

    _resolver: Resolver;

    init(Container: Container): void {
        this._resolver = Container.getResolver(this.annotation.alias)
    }

    createResolver(): Resolver {
        return new AliasResolver(this._resolver)
    }
}

export default {
    kind: 'alias',
    create(annotation: AliasAnnotation): Provider {
        return new AliasProvider(annotation)
    }
}
