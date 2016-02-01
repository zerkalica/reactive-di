/* @flow */

import type {
    Cacheable,
    AnyDep
} from '../../interfaces/nodeInterfaces'
import type {Subscription} from '../../interfaces/observableInterfaces'
import type {MetaDep} from '../meta/metaInterfaces'
import type {ModelDep} from '../model/modelInterfaces'

export default function defaultFinalizer(dep: AnyDep, target: AnyDep): void {
    const {base} = dep
    switch(target.kind) {
        case 'asyncmodel':
        case 'model':
            target.dataOwners.push((base: Cacheable))
            if (target.updater) {
                base.subscriptions.push((target.updater: Subscription))
            }
            break
        case 'meta':
            const {sources} = target
            for(let i = 0, l = sources.length; i < l; i++) {
                const {metaOwners} = sources[i]
                metaOwners.push((base: Cacheable))
            }
            break
        default:
            throw new TypeError('Unhandlered dep type: ' + target.kind)
    }
}
