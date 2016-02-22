/* @flow */

import {AnnotationBaseImpl} from 'reactive-di/pluginsCommon/pluginImpls'
import type {
    DepId,
    Deps,
    AnnotationBase
} from 'reactive-di/i/annotationInterfaces'
import type {SyncUpdater} from 'reactive-di/i/plugins/setterInterfaces'
import type {SyncSetterAnnotation} from 'reactive-di/i/plugins/setterInterfaces' // eslint-disable-line

// implements SyncSetterAnnotation
export default class SyncSetterAnnotationImpl<V: Object> {
    kind: 'syncsetter';
    base: AnnotationBase<SyncUpdater<V>>;
    deps: ?Deps;
    model: Class<V>;

    constructor(
        id: DepId,
        model: Class<V>,
        target: SyncUpdater<V>,
        deps: ?Deps,
        tags: Array<string>
    ) {
        this.kind = 'syncsetter'
        this.base = new AnnotationBaseImpl(id, this.kind, tags, target)
        this.deps = deps
        this.model = model
    }
}
