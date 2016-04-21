/* @flow */
import type {ClassAnnotation} from 'reactive-di/i/pluginsInterfaces'
import type {
    ArgumentHelper,
    PipeProvider,
    Container
} from 'reactive-di/i/coreInterfaces'

import BaseProvider from 'reactive-di/core/BaseProvider'

class ClassProvider<V: Object> extends BaseProvider {
    type: 'pipe' = 'pipe';
    value: V;

    _helper: ArgumentHelper = (null: any);
    _annotation: ClassAnnotation;

    constructor(annotation: ClassAnnotation) {
        super(annotation)
        this._annotation = annotation
    }

    init(container: Container): void {
        this._helper = container.createArgumentHelper(this._annotation)
    }

    update(): void {
        this.value = this._helper.createObject()
    }
}

export default class ClassPlugin {
    kind: 'klass' = 'klass';
    create(annotation: ClassAnnotation): PipeProvider<Object> {
        return new ClassProvider(annotation)
    }
}
