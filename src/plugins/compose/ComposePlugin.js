/* @flow */
import type {
    ComposeAnnotation,
    DepFn,
    Container,
    Provider,
    ArgumentHelper,
    PassiveProvider,
    CreateContainerManager
} from 'reactive-di'

import BaseProvider from 'reactive-di/core/BaseProvider'

class ComposeProvider<V> extends BaseProvider {
    type: 'passive' = 'passive';
    value: DepFn<V>;

    constructor(annotation: ComposeAnnotation, container: Container) {
        super(annotation, container)
        this.isCached = true
        const helper: ArgumentHelper = container.createArgumentHelper(annotation);

        this.value = function getValue(...args: Array<any>): V {
            return helper.invokeComposed(args)
        }
    }

    addDependency(dependency: Provider): void {} // eslint-disable-line
}

export default class ComposePlugin {
    kind: 'compose' = 'compose';
    createContainerManager: CreateContainerManager;

    createProvider(annotation: ComposeAnnotation, container: Container): PassiveProvider {
        return new ComposeProvider(annotation, container)
    }
}
