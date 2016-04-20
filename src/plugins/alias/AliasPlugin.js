/* @flow */
import type {AliasAnnotation} from 'reactive-di/i/pluginsInterfaces'
import type {
    Container,
    Provider
} from 'reactive-di/i/coreInterfaces'

export default class AliasPlugin {
    kind: 'alias' = 'alias';
    create(annotation: AliasAnnotation, container: Container): Provider {
        return container.getProvider(annotation.alias)
    }
}
