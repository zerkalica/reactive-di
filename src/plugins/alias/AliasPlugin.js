/* @flow */
import type {
    Tag
} from 'reactive-di/i/annotationInterfaces'
import type {AliasAnnotation} from 'reactive-di/i/pluginsInterfaces'
import type {
    Context,
    Provider
} from 'reactive-di/i/nodeInterfaces'

import BaseProvider from 'reactive-di/core/BaseProvider'

class AliasProvider extends BaseProvider<AliasAnnotation> {
    kind: 'alias';
    displayName: string;
    tags: Array<Tag>;
    annotation: AliasAnnotation;

    _provider: Provider;

    init(context: Context): void {
        this._provider = context.getProvider(this.annotation.alias)
    }

    reset(): void {
        this._provider.reset()
    }

    resolve(): any {
        return this._provider.resolve()
    }
}

export default {
    kind: 'alias',
    create(annotation: AliasAnnotation): Provider { // eslint-disable-line
        return new AliasProvider(annotation)
    }
}
