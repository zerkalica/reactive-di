/* @flow */

import merge from '../../utils/merge'
import EntityMetaImpl, {updateMeta} from '../asyncmodel/EntityMetaImpl'
import {DepBaseImpl} from '../../core/pluginImpls'
import type {
    DepId,
    Info
} from '../../interfaces/annotationInterfaces'
import type {
    AnyDep,
    DepBase,
    AnnotationResolver
} from '../../interfaces/nodeInterfaces'
import type {Plugin} from '../../interfaces/pluginInterfaces'
import type {
    EntityMeta,
    MetaSource
} from '../asyncmodel/asyncmodelInterfaces'
import type {
    MetaDep,
    MetaAnnotation
} from './metaInterfaces'

// implements MetaDep
class MetaDepImpl<E> {
    kind: 'meta';
    base: DepBase;
    sources: Array<MetaSource>;
    _value: EntityMeta<E>;
    promise: Promise<any>;

    constructor(
        id: DepId,
        info: Info
    ) {
        this.kind = 'meta'
        this.base = new DepBaseImpl(id, info)
        this.sources = []
        this._value = new EntityMetaImpl({peding: true})
    }

    resolve(): EntityMeta<E> {
        const {base, sources} = this
        if (!base.isRecalculate) {
            return this._value
        }
        const meta: EntityMeta = new EntityMetaImpl();
        const promises: Array<Promise<any>> = [];
        for (let i = 0, l = sources.length; i < l; i++) {
            const sourceDep = sources[i]
            updateMeta(meta, sourceDep.meta)
            promises.push(sourceDep.promise)
        }

        this._value = merge(this._value, meta)
        this.promise = Promise.all(promises)
        base.isRecalculate = false
        return this._value
    }
}

// depends on asyncmodel
// implements Plugin
export default class MetaPlugin {
    create<E>(annotation: MetaAnnotation<E>, acc: AnnotationResolver): void {
        const {base} = annotation
        const dep: MetaDep<E> = new MetaDepImpl(base.id, base.info);

        acc.addRelation(base.id)
        const newAcc: AnnotationResolver = acc.newRoot();
        newAcc.begin(dep)
        newAcc.resolve(base.target)
        newAcc.end(dep)
    }

    finalize<E>(dep: MetaDep<E>, target: AnyDep): void {
        if (target.kind === 'asyncmodel') {
            target.metaOwners.push(dep.base)
            dep.sources.push((target: MetaSource))
        }
    }
}
