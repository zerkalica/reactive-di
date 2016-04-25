/* @flow */
import type {AliasAnnotation} from 'reactive-di/i/pluginsInterfaces'
import type {
    Container,
    Provider,
    Plugin
} from 'reactive-di/i/coreInterfaces'

class AliasPlugin {
    kind: 'alias' = 'alias';
    createProvider(annotation: AliasAnnotation, container: Container): Provider {
        return container.getProvider(annotation.alias)
    }
}

export default function createAliasPlugin(): Plugin {
    return new AliasPlugin()
}
