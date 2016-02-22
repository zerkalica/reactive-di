/* @flow */

import type {
    AnnotationBase,
    DepId
} from 'reactive-di/i/annotationInterfaces'
import {AnnotationBaseImpl} from 'reactive-di/pluginsCommon/pluginImpls'
import type {GetterAnnotation} from 'reactive-di/i/plugins/getterInterfaces' // eslint-disable-line

// implements GetterAnnotation
export default class GetterAnnotationImpl<V: Object> {
    kind: 'getter';
    base: AnnotationBase<Class<V>>;

    constructor(
        id: DepId,
        target: Class<V>,
        tags: Array<string>
    ) {
        this.kind = 'getter'
        this.base = new AnnotationBaseImpl(id, this.kind, tags, target)
    }
}
