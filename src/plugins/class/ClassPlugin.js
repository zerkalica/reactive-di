/* @flow */
import type {ClassAnnotation} from 'reactive-di/i/pluginsInterfaces'
import type {
    ArgumentHelper,
    Provider,
    Container
} from 'reactive-di/i/coreInterfaces'

import BaseProvider from 'reactive-di/core/BaseProvider'

class ClassProvider<V: Object> extends BaseProvider<V, ClassAnnotation, Provider> {
    kind: 'klass';
    annotation: ClassAnnotation;
    isCached: boolean;

    value: V;

    _helper: ArgumentHelper;

    init(container: Container): void {
        this._helper = container.createArgumentHelper(this.annotation)
    }

    update(): void {
        this.value = this._helper.createObject()
        this.isCached = true
    }
}

export default {
    kind: 'klass',
    create(annotation: ClassAnnotation): Provider<any, ClassAnnotation, Provider> {
        return new ClassProvider(annotation)
    }
}
