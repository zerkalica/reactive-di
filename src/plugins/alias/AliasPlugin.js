/* @flow */
import type {AliasAnnotation} from 'reactive-di/i/pluginsInterfaces'
import type {
    Context,
    Provider
} from 'reactive-di/i/nodeInterfaces'

export default {
    kind: 'alias',
    create(annotation: AliasAnnotation, acc: Context): Provider {
        return acc.getProvider(annotation.alias)
    }
}
