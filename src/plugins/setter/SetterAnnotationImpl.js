/* @flow */

import {AnnotationBaseImpl} from 'reactive-di/core/pluginImpls'
import type {
    DepId,
    Deps,
    AnnotationBase
} from 'reactive-di/i/annotationInterfaces'
import type {AnyUpdater} from 'reactive-di/i/plugins/asyncmodelInterfaces'
import type {SetterAnnotation} from 'reactive-di/i/plugins/setterInterfaces' // eslint-disable-line

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
