/* @flow */

import type {Deps, AnnotationBase, DepFn} from '../../interfaces/annotationInterfaces'
import {AnnotationBaseImpl} from '../../core/pluginImpls'
import type {SetterAnnotation} from './setterInterfaces'
import type {Loader} from '../asyncmodel/asyncmodelInterfaces'

// implements SetterAnnotation
export default class SetterAnnotationImpl<V: Object, E> {
    kind: 'setter';
    base: AnnotationBase<Loader<V, E>>;
    deps: ?Deps;
    model: Class<V>;

    constructor(
        model: Class<V>,
        target: Loader<V, E>,
        deps: ?Deps,
        tags: Array<string>
    ) {
        this.kind = 'setter'
        this.base = new AnnotationBaseImpl(this.kind, tags, target)
        this.deps = deps
        this.model = model
    }
}
