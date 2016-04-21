/* @flow */
import type {ComposeAnnotation} from 'reactive-di/i/pluginsInterfaces'
import type {
    DepFn,
    Container,
    ArgumentHelper,
    PipeProvider
} from 'reactive-di/i/coreInterfaces'

import BaseProvider from 'reactive-di/core/BaseProvider'

class ComposeProvider<V> extends BaseProvider {
    type: 'pipe' = 'pipe';
    value: DepFn<V>;

    _annotation: ComposeAnnotation;

    constructor(annotation: ComposeAnnotation) {
        super(annotation)
        this._annotation = annotation
    }

    init(container: Container): void {
        const helper: ArgumentHelper = container.createArgumentHelper(this._annotation);
        this.isCached = true
        this.value = function getValue(...args: Array<any>): V {
            return helper.invokeComposed(args)
        }
    }
}

export default class ComposePlugin {
    kind: 'compose' = 'compose';

    create(annotation: ComposeAnnotation): PipeProvider<DepFn> {
        return new ComposeProvider(annotation)
    }
}
