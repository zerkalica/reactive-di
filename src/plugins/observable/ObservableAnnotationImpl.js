/* @flow */

import type {
    DepId,
    Deps,
    DepFn,
    AnnotationBase,
    Dependency
} from '../../interfaces/annotationInterfaces'
import {AnnotationBaseImpl} from '../../core/pluginImpls'
import type {ObservableAnnotation} from './observableInterfaces' // eslint-disable-line
import type {SimpleMap} from '../../interfaces/modelInterfaces'

function pass<V>(deps: V): V {
    return deps
}

// implements ObservableAnnotation
export default class ObservableAnnotationImpl<V> {
    kind: 'observable';
    base: AnnotationBase<DepFn<V>>;
    deps: Deps;

    constructor(
        id: DepId,
        deps: Deps,
        tags: Array<string>
    ) {
        this.kind = 'observable'
        this.base = new AnnotationBaseImpl(id, this.kind, tags, pass)
        this.deps = deps
    }
}
