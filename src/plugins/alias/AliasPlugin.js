/* @flow */
import type {AliasAnnotation} from 'reactive-di/i/pluginsInterfaces'
import type {
    Tag,
    Container,
    Provider,
    Resolver
} from 'reactive-di/i/coreInterfaces'

import BaseProvider from 'reactive-di/core/BaseProvider'

class AliasProvider extends BaseProvider<AliasAnnotation> {
    kind: 'alias';
    displayName: string;
    tags: Array<Tag>;
    annotation: AliasAnnotation;

    createResolver(container: Container): Resolver {
        return container.getResolver(this.annotation.alias)
    }
}

export default {
    kind: 'alias',
    create(annotation: AliasAnnotation): Provider {
        return new AliasProvider(annotation)
    }
}
