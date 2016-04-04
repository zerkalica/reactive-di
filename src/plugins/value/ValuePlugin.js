/* @flow */
import type {
    Tag
} from 'reactive-di/i/annotationInterfaces'
import type {ValueAnnotation} from 'reactive-di/i/pluginsInterfaces'
import type {
    Context,
    ResolvableDep
} from 'reactive-di/i/nodeInterfaces'

import getFunctionName from 'reactive-di/utils/getFunctionName'

export class ValueDep<V: any> {
    kind: 'value';
    displayName: string;
    tags: Array<Tag>;
    isRecalculate: boolean;

    _value: V;

    constructor(annotation: ValueAnnotation) {
        this.kind = 'value'
        const fnName: string = getFunctionName(annotation.target);
        this.displayName = this.kind + '@' + fnName
        this.tags = [this.kind, fnName]

        this.isRecalculate = false
        this._value = annotation.value
    }

    resolve(): Function {
        return this._value
    }
}

// depends on meta
// implements Plugin
export default class ValuePlugin {
    kind: 'value' = 'value';

    create(annotation: ValueAnnotation, acc: Context): ResolvableDep { // eslint-disable-line
        return new ValueDep(annotation);
    }

    finalize(dep: ValueDep, annotation: ValueAnnotation, acc: Context): void { // eslint-disable-line
    }
}
