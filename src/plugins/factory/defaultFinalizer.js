/* @flow */

import type {
    Cacheable,
    AnyDep,
    AsyncSubscription
} from 'reactive-di/i/nodeInterfaces'

export default function defaultFinalizer(dep: AnyDep, target: AnyDep): void {
    const {base} = dep
    switch (target.kind) {
        /* eslint-disable indent */
        case 'asyncmodel':
        case 'model':
            target.dataOwners.push((base: Cacheable))
            if (target.updater) {
                base.subscriptions.push((target.updater: AsyncSubscription))
            }
            break
        case 'meta':  // eslint-disable-line
            const {sources} = target
            for (let i = 0, l = sources.length; i < l; i++) {
                const {metaOwners} = sources[i]
                metaOwners.push((base: Cacheable))
            }
            break
        default:
            throw new TypeError('Unhandlered dep type: ' + target.kind)
    }
}
