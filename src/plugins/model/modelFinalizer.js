/* @flow */
import type {AnyModelDep} from './modelInterfaces'
import type {
    Cacheable,
    AnyDep
} from '../../interfaces/nodeInterfaces'

export default function modelFinalizer(dep: AnyModelDep, child: AnyDep): void {
    const {base} = dep
    switch (child.kind) {
        case 'asyncmodel':
        case 'model':
            const {base: childBase, dataOwners: childOwners} = child
            dep.dataOwners.push(childBase)
            childOwners.push((base: Cacheable))
            childBase.relations.push(base.id)
            break
        default:
            throw new TypeError('Unhandlered dep type: ' + child.kind)
    }
}
