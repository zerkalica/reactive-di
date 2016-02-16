/* @flow */
import type {AsyncModelDep} from 'reactive-di/plugins/asyncmodel/asyncmodelInterfaces'
import type {ModelDep} from 'reactive-di/plugins/model/modelInterfaces'

import type {
    Cacheable,
    AnyDep
} from 'reactive-di/i/nodeInterfaces'

type AnyModelDep<V, E> = ModelDep<V> | AsyncModelDep<V, E>;

export default function modelFinalizer(dep: AnyModelDep, child: AnyDep): void {
    const {base} = dep
    switch (child.kind) {
        /* eslint-disable indent */
        case 'asyncmodel':
        case 'model': // eslint-disable-line
            const {base: childBase, dataOwners: childOwners} = child
            dep.dataOwners.push(childBase)
            childOwners.push((base: Cacheable))
            childBase.relations.push(base.id)
            break
        default:
            throw new TypeError('Unhandlered dep type: ' + child.kind)
    }
}
