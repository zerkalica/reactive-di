/* @flow */

import type {Deps, AnnotationBase, DepFn} from '../../annotationInterfaces'
import {AnnotationBaseImpl} from '../../core/pluginImpls'
import type {SetterAnnotation, Setter} from './setterInterfaces'

// implements SetterAnnotation
export default class SetterAnnotationImpl<V: Object> {
    kind: 'setter';
    base: AnnotationBase<DepFn<Setter<V>>>;
    deps: ?Deps;
    model: Class<V>;

    constructor(
        model: Class<V>,
        target: DepFn<Setter<V>>,
        deps: ?Deps,
        tags: Array<string>
    ) {
        this.kind = 'setter'
        this.base = new AnnotationBaseImpl(this.kind, tags, target)
        this.deps = deps
        this.model = model
    }
}
