/* @flow */

import type {
    AnnotationBase,
    DepId
} from '../../interfaces/annotationInterfaces'
import {AnnotationBaseImpl} from '../../core/pluginImpls'
import type {GetterAnnotation} from './getterInterfaces' // eslint-disable-line

// implements GetterAnnotation
export default class GetterAnnotationImpl<V: Object> {
    kind: 'getter';
    base: AnnotationBase<Class<V>>; // eslint-disable-line

    constructor(
        id: DepId,
        target: Class<V>, // eslint-disable-line
        tags: Array<string>
    ) {
        this.kind = 'getter'
        this.base = new AnnotationBaseImpl(id, this.kind, tags, target)
    }
}
