/* @flow */
import type {FactoryAnnotation} from 'reactive-di/i/pluginsInterfaces'
import type {
    Tag,
    ArgumentHelper,
    Dependency,
    Container,
    Provider
} from 'reactive-di/i/coreInterfaces'

import BaseProvider from 'reactive-di/core/BaseProvider'

class FactoryProvider extends BaseProvider<FactoryAnnotation> {
    kind: 'factory';
    displayName: string;
    tags: Array<Tag>;
    annotation: FactoryAnnotation;
    _value: any;
    _helper: ArgumentHelper;
    _target: Dependency;

    init(container: Container): void {
        this._helper = container.createArgumentHelper(this.annotation);
    }

    get(): any {
        if (this.isCached) {
            return this._value
        }
        this._value = this._helper.invokeFunction()
        this.isCached = true

        return this._value
    }
}

export default {
    kind: 'factory',
    create(annotation: FactoryAnnotation): Provider<FactoryAnnotation> {
        return new FactoryProvider(annotation)
    }
}
