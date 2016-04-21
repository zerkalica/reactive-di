/* @flow */

import type {FactoryAnnotation} from 'reactive-di/i/pluginsInterfaces'
import type {
    ArgumentHelper,
    Container,
    PipeProvider
} from 'reactive-di/i/coreInterfaces'

import BaseProvider from 'reactive-di/core/BaseProvider'

class FactoryProvider<V> extends BaseProvider {
    type: 'pipe' = 'pipe';
    value: V;
    _helper: ArgumentHelper = (null: any);
    _annotation: FactoryAnnotation;

    constructor(annotation: FactoryAnnotation) {
        super(annotation)
        this._annotation = annotation
    }

    init(container: Container): void {
        this._helper = container.createArgumentHelper(this._annotation);
    }

    update(): void {
        this.value = this._helper.invokeFunction()
    }
}

export default class FactoryPlugin {
    kind: 'factory' = 'factory';
    create(annotation: FactoryAnnotation): PipeProvider {
        return new FactoryProvider(annotation)
    }
}
