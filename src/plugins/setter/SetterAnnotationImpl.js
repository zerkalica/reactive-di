/* @flow */

import {AnnotationBaseImpl} from '../../annotations/annotationImpl'
import type {AnnotationBase, DepFn} from '../../annotationInterfaces'
import type {Deps} from '../factory/factoryInterfaces'
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
