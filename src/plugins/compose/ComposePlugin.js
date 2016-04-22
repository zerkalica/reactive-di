/* @flow */
import type {ComposeAnnotation} from 'reactive-di/i/pluginsInterfaces'
import type {
    DepFn,
    Container,
    ArgumentHelper,
    PipeProvider,
    Plugin
} from 'reactive-di/i/coreInterfaces'

import BaseProvider from 'reactive-di/core/BaseProvider'

class ComposeProvider<V> extends BaseProvider {
    type: 'pipe' = 'pipe';
    value: DepFn<V>;

    constructor(annotation: ComposeAnnotation, container: Container) {
        super(annotation, container)
        this.isCached = true
        const helper: ArgumentHelper = container.createArgumentHelper(annotation);

        this.value = function getValue(...args: Array<any>): V {
            return helper.invokeComposed(args)
        }
    }
}

class ComposePlugin {
    kind: 'compose' = 'compose';

    createContainer(annotation: ComposeAnnotation, container: Container): Container {
        return container
    }

    createProvider(annotation: ComposeAnnotation, container: Container): PipeProvider {
        return new ComposeProvider(annotation, container)
    }
}

export default function createComposePlugin(): Plugin {
    return new ComposePlugin()
}
