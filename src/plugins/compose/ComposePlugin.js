/* @flow */
import type {ComposeAnnotation} from 'reactive-di/i/pluginsInterfaces'
import type {
    DepFn,
    Container,
    ArgumentHelper,
    Provider
} from 'reactive-di/i/coreInterfaces'

import BaseProvider from 'reactive-di/core/BaseProvider'

class ComposeProvider<V> extends BaseProvider<DepFn<V>, ComposeAnnotation, Provider> {
    kind: 'compose';
    value: DepFn<V>;

    init(annotation: ComposeAnnotation, container: Container): void {
        const helper: ArgumentHelper = container.createArgumentHelper(annotation);
        this.isCached = true
        this.value = function getValue(...args: Array<any>): V {
            return helper.invokeComposed(args)
        }
    }
}

export default class ComposePlugin {
    kind: 'compose' = 'compose';

    create(annotation: ComposeAnnotation): Provider<DepFn, ComposeAnnotation, Provider> {
        return new ComposeProvider(annotation)
    }
}
