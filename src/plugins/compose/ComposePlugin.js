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
    annotation: ComposeAnnotation;

    value: DepFn<V>;

    init(container: Container): void {
        const helper: ArgumentHelper = container.createArgumentHelper(this.annotation);
        this.isCached = true
        this.value = function getValue(...args: Array<any>): V {
            return helper.invokeComposed(args)
        }
    }

    addDependency(dependency: Provider): void {
        this.dependencies.push(dependency)
    }
}

export default {
    kind: 'compose',
    create(annotation: ComposeAnnotation): Provider<DepFn, ComposeAnnotation, Provider> {
        return new ComposeProvider(annotation)
    }
}
