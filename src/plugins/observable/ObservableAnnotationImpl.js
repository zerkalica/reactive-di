/* @flow */

import type {
    DepId,
    Deps,
    DepFn,
    AnnotationBase
} from 'reactive-di/i/annotationInterfaces'
import {AnnotationBaseImpl} from 'reactive-di/pluginsCommon/pluginImpls'
import type {ObservableAnnotation} from 'reactive-di/i/plugins/observableInterfaces' // eslint-disable-line

// implements ObservableAnnotation
export default class ObservableAnnotationImpl<V> {
    kind: 'observable';
    base: AnnotationBase<DepFn<V>>;
    deps: Deps;

    constructor(
        id: DepId,
        target: DepFn<V>,
        deps: Deps,
        tags: Array<string>
    ) {
        this.kind = 'observable'
        this.base = new AnnotationBaseImpl(id, this.kind, tags, target)
        this.deps = deps
    }
}
