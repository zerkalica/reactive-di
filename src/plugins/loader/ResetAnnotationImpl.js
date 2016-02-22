/* @flow */

import {AnnotationBaseImpl} from 'reactive-di/pluginsCommon/pluginImpls'
import type {
    DepId,
    AnnotationBase
} from 'reactive-di/i/annotationInterfaces'
import type {AsyncUpdater} from 'reactive-di/i/plugins/setterInterfaces'
import type {ResetAnnotation} from 'reactive-di/i/plugins/loaderInterfaces' // eslint-disable-line

// implements ResetAnnotation
export default class ResetAnnotationImpl<V: Object, E> {
    kind: 'reset';
    base: AnnotationBase<AsyncUpdater<V, E>>;

    constructor(
        id: DepId,
        target: AsyncUpdater<V, E>,
        tags: Array<string>
    ) {
        this.kind = 'reset'
        this.base = new AnnotationBaseImpl(id, this.kind, tags, target)
    }
}
