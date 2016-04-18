/* @flow */
import type {ClassAnnotation} from 'reactive-di/i/pluginsInterfaces'
import type {
    ArgumentHelper,
    Tag,
    Provider,
    Container
} from 'reactive-di/i/coreInterfaces'

import BaseProvider from 'reactive-di/core/BaseProvider'

class ClassProvider extends BaseProvider<ClassAnnotation, Provider> {
    kind: 'klass';
    displayName: string;
    tags: Array<Tag>;
    annotation: ClassAnnotation;
    isCached: boolean;

    _value: any;
    _helper: ArgumentHelper;
    _target: Dependency;

    init(container: Container): void {
        this._helper = container.createArgumentHelper(this.annotation)
        this._target = this.annotation.target
    }

    get(): any {
        if (this.isCached) {
            return this._value
        }

        this._value = this._helper.createObject()
        this.isCached = true

        return this._value
    }
}

export default {
    kind: 'klass',
    create(annotation: ClassAnnotation): Provider<ClassAnnotation, Provider> {
        return new ClassProvider(annotation)
    }
}
