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
    value: V;
    _helper: ArgumentHelper = (null: any);

    init(annotation: ClassAnnotation, container: Container): void {
        this._helper = container.createArgumentHelper(annotation)
    }

    update(): void {
        this.value = this._helper.createObject()
    }

    addDependency(dependency: Provider): void {
        dependency.addDependant(this)
    }
}

export default class ClassPlugin {
    kind: 'klass' = 'klass';
    create(annotation: ClassAnnotation): Provider<Object, ClassAnnotation, Provider> {
        return new ClassProvider(annotation)
    }
}
