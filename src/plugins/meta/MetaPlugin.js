/* @flow */
import EntityMetaImpl, {updateMeta} from '../model/EntityMetaImpl'
import type {
    DepId,
    Info
} from '../../interfaces/annotationInterfaces'
import {DepBaseImpl} from '../../core/pluginImpls'
import type {
    AnyDep,
    DepBase,
    AnnotationResolver
} from '../../interfaces/nodeInterfaces'
import type {Plugin} from '../../interfaces/pluginInterfaces'
import type {
    AsyncUpdater,
    EntityMeta
} from '../model/modelInterfaces'
import type {
    MetaDep,
    MetaAnnotation
} from './metaInterfaces'

// implements MetaDep
class MetaDepImpl<E> {
    kind: 'meta';
    base: DepBase<EntityMeta<E>>;
    sources: Array<AsyncUpdater>;

    constructor(
        id: DepId,
        info: Info
    ) {
        this.kind = 'meta'
        this.base = new DepBaseImpl(id, info)
        this.sources = []
    }

    resolve(): void {
        const {base, sources} = this
        if (!base.isRecalculate) {
            return
        }
        const meta: EntityMeta = new EntityMetaImpl();
        for (let i = 0, l = sources.length; i < l; i++) {
            updateMeta(meta, sources[i].meta)
        }
        base.value = merge(base.value, meta)
        base.isRecalculate = false
    }
}

// depends on model
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
        if (target.kind === 'model' && target.updater) {
            target.updater.metaOwners.push(dep.base)
            dep.sources.push(((target.updater: any): AsyncUpdater))
        }
    }
}
