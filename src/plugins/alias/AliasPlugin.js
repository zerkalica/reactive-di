/* @flow */
import type {AliasAnnotation} from 'reactive-di/i/pluginsInterfaces'
import type {
    Container,
    Provider
} from 'reactive-di/i/coreInterfaces'

export default {
    kind: 'alias',
    create(annotation: AliasAnnotation, container: Container): Provider<AliasAnnotation> {
        return container.getProvider(annotation.alias)
    }
}
