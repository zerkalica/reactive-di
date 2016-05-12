/* @flow */
import type {
    AliasAnnotation,
    Container,
    Provider,
    Plugin
} from 'reactive-di'

class AliasPlugin {
    kind: 'alias' = 'alias';
    createProvider(annotation: AliasAnnotation, container: Container): Provider {
        return container.getProvider(annotation.alias)
    }
}

export default function createAliasPlugin(): Plugin {
    return new AliasPlugin()
}
