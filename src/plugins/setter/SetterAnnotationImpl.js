/* @flow */

import {AnnotationBaseImpl} from '../../core/pluginImpls'
import type {
    DepId,
    Deps,
    AnnotationBase,
    DepFn
} from '../../interfaces/annotationInterfaces'
import type {AnyUpdater} from '../asyncmodel/asyncmodelInterfaces'
import type {SetterAnnotation} from './setterInterfaces'

// implements SetterAnnotation
export default class SetterAnnotationImpl<V: Object, E> {
    kind: 'setter';
    base: AnnotationBase<AnyUpdater<V, E>>;
    deps: ?Deps;
    model: Class<V>;

    constructor(
        id: DepId,
        model: Class<V>,
        target: AnyUpdater<V, E>,
        deps: ?Deps,
        tags: Array<string>
    ) {
        this.kind = 'setter'
        this.base = new AnnotationBaseImpl(id, this.kind, tags, target)
        this.deps = deps
        this.model = model
    }
}
