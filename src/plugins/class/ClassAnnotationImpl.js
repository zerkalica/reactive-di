/* @flow */

import {AnnotationBaseImpl} from 'reactive-di/core/pluginImpls'
import type {
    DepId,
    AnnotationBase
} from 'reactive-di/i/annotationInterfaces'
import type {Deps} from 'reactive-di/i/annotationInterfaces'
import type {ClassAnnotation} from 'reactive-di/i/plugins/classInterfaces' // eslint-disable-line

// implements ClassAnnotation
export default class ClassAnnotationImpl<V: Object> {
    kind: 'class';
    base: AnnotationBase<Class<V>>;
    deps: ?Deps;

    constructor(
        id: DepId,
        target: Class<V>,
        deps: ?Deps,
        tags: Array<string>
    ) {
        this.kind = 'class'
        this.base = new AnnotationBaseImpl(id, this.kind, tags, target)
        this.deps = deps
    }
}
