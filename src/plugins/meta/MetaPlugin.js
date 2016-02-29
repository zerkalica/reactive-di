/* @flow */

import merge from 'reactive-di/utils/merge'
import {DepBaseImpl, EntityMetaImpl} from 'reactive-di/pluginsCommon/pluginImpls'
import type {
    DepId
} from 'reactive-di/i/annotationInterfaces'
import type {
    DepBase,
    AnnotationResolver
} from 'reactive-di/i/nodeInterfaces'
import type {Plugin} from 'reactive-di/i/pluginInterfaces' // eslint-disable-line
import type {EntityMeta} from 'reactive-di/i/nodeInterfaces'
import type {
    MetaDep,
    MetaSource,
    MetaAnnotation
} from 'reactive-di/i/plugins/metaInterfaces'
import type {AsyncSetterDep} from 'reactive-di/i/plugins/setterInterfaces'

function updateMeta<E>(meta: EntityMeta<E>, src: EntityMeta<E>): boolean {
    const {pending, rejected, fulfilled, reason} = src
    let isChanged = false
    /* eslint-disable no-param-reassign */
    if (!fulfilled) {
        isChanged = true
        meta.fulfilled = false
    }
    if (rejected) {
        isChanged = true
        meta.rejected = rejected
    }
    if (reason) {
        isChanged = true
        meta.reason = reason
    }
    if (pending) {
        isChanged = true
        meta.pending = pending
    }
    /* eslint-enable no-param-reassign */

    return isChanged
}

// implements MetaDep
class MetaDepImpl<E> {
    kind: 'meta';
    base: DepBase;
    sources: Array<MetaSource>;
    _value: EntityMeta<E>;

    constructor(annotation: MetaAnnotation<E>) {
        this.kind = 'meta'
        this.base = new DepBaseImpl(annotation)
        this.sources = []
        this._value = new EntityMetaImpl({
            pending: false
        })
    }

    resolve(): EntityMeta<E> {
        const {base, sources} = this
        if (!base.isRecalculate) {
            return this._value
        }
        const meta: EntityMeta<E> = new EntityMetaImpl({
            fulfilled: true
        });
        for (let i = 0, l = sources.length; i < l; i++) {
            const sourceDep = sources[i]
            updateMeta(meta, sourceDep.meta)
        }
        this._value = merge(this._value, meta)
        base.isRecalculate = false
        return this._value
    }
}

// depends on asyncmodel
// implements Plugin
export default class MetaPlugin {
    create<E>(annotation: MetaAnnotation<E>, acc: AnnotationResolver): void {
        const id: DepId = annotation.id = acc.createId(); // eslint-disable-line
        const dep: MetaDep<E> = new MetaDepImpl(annotation);

        acc.addRelation(id)
        const newAcc: AnnotationResolver = acc.newRoot();
        newAcc.begin(dep)
        newAcc.resolve(annotation.target)
        newAcc.end(dep)
    }

    finalize<Dep: Object, E>(dep: MetaDep<E>, target: Dep|AsyncSetterDep): void {
        if (target.kind === 'asyncsetter') {
            target.metaOwners.push(dep.base)
            dep.sources.push((target: MetaSource))
        }
    }
}
