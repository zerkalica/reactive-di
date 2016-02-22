/* @flow */

import {AnnotationBaseImpl} from 'reactive-di/pluginsCommon/pluginImpls'
import type {
    DepId,
    Deps,
    AnnotationBase
} from 'reactive-di/i/annotationInterfaces'
import type {AsyncUpdater} from 'reactive-di/i/plugins/setterInterfaces'
import type {AsyncSetterAnnotation} from 'reactive-di/i/plugins/setterInterfaces' // eslint-disable-line

// implements AsyncSetterAnnotation
export default class AsyncSetterAnnotationImpl<V: Object, E> {
    kind: 'asyncsetter';
    base: AnnotationBase<AsyncUpdater<V, E>>;
    deps: ?Deps;
    model: Class<V>;

    constructor(
        id: DepId,
        model: Class<V>,
        target: AsyncUpdater<V, E>,
        deps: ?Deps,
        tags: Array<string>
    ) {
        this.kind = 'asyncsetter'
        this.base = new AnnotationBaseImpl(id, this.kind, tags, target)
        this.deps = deps
        this.model = model
    }
}
