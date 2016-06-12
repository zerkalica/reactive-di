/* @flow */
import type {
    AliasAnnotation,
    Container,
    Provider,
    CreateContainerManager
} from 'reactive-di'

export default class AliasPlugin {
    kind: 'alias' = 'alias';
    createContainerManager: CreateContainerManager;

    createProvider(annotation: AliasAnnotation, container: Container): Provider {
        return container.getProvider(annotation.alias)
    }
}
