/* @flow */
import type {
    Tag
} from 'reactive-di/i/annotationInterfaces'
import type {AliasAnnotation} from 'reactive-di/i/pluginsInterfaces'
import type {
    Context,
    Provider,
    Resolver
} from 'reactive-di/i/nodeInterfaces'

import BaseProvider from 'reactive-di/core/BaseProvider'

class AliasProvider extends BaseProvider<AliasAnnotation> {
    kind: 'alias';
    displayName: string;
    tags: Array<Tag>;
    annotation: AliasAnnotation;

    _realResolver: Resolver;

    init(context: Context): void {
        this._realResolver = context.getResolver(this.annotation.alias)
    }

    createResolver(): Resolver {
        return this._realResolver
    }
}

export default {
    kind: 'alias',
    create(annotation: AliasAnnotation): Provider { // eslint-disable-line
        return new AliasProvider(annotation)
    }
}
