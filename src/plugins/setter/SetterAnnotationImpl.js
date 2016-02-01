/* @flow */

import type {Deps, AnnotationBase, DepFn} from '../../interfaces/annotationInterfaces'
import {AnnotationBaseImpl} from '../../core/pluginImpls'
import type {SetterAnnotation, SetterResult} from './setterInterfaces'

// implements SetterAnnotation
export default class SetterAnnotationImpl<V: Object> {
    kind: 'setter';
    base: AnnotationBase<DepFn<SetterResult<V>>>;
    deps: ?Deps;
    model: Class<V>;

    constructor(
        model: Class<V>,
        target: DepFn<SetterResult<V>>,
        deps: ?Deps,
        tags: Array<string>
    ) {
        this.kind = 'setter'
        this.base = new AnnotationBaseImpl(this.kind, tags, target)
        this.deps = deps
        this.model = model
    }
}
