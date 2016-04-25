/* @flow */
import type {ClassAnnotation} from 'reactive-di/i/pluginsInterfaces'
import type {
    ArgumentHelper,
    PassiveProvider,
    Container,
    Plugin
} from 'reactive-di/i/coreInterfaces'

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

class ClassPlugin {
    kind: 'klass' = 'klass';

    createProvider(annotation: ClassAnnotation, container: Container): PassiveProvider {
        return new ClassProvider(annotation, container)
    }
}

export default function createClassPlugin(): Plugin {
    return new ClassPlugin()
}
