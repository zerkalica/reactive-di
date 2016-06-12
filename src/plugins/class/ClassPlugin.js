/* @flow */
import type {
    ClassAnnotation,
    ArgumentHelper,
    PassiveProvider,
    Container,
    CreateContainerManager
} from 'reactive-di'

import BaseProvider from 'reactive-di/core/BaseProvider'

class ClassProvider<V> extends BaseProvider {
    type: 'passive' = 'passive';
    value: V;

    _helper: ArgumentHelper;

    constructor(annotation: ClassAnnotation, container: Container) {
        super(annotation, container)
        this._helper = container.createArgumentHelper(annotation)
    }

    update(): void {
        this.value = this._helper.createObject()
    }
}

export default class ClassPlugin {
    kind: 'klass' = 'klass';
    createContainerManager: CreateContainerManager;

    createProvider(annotation: ClassAnnotation, container: Container): PassiveProvider {
        return new ClassProvider(annotation, container)
    }
}
