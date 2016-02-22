/* @flow */

import type {
    Cacheable,
    AnyDep
} from 'reactive-di/i/nodeInterfaces'

export default function defaultFinalizer(dep: AnyDep, target: AnyDep): void {
    const {base} = dep
    switch (target.kind) {
        case 'model':
            target.dataOwners.push((base: Cacheable))
            break
        case 'asyncsetter':
            break
        case 'meta': {
            const {sources} = target
            for (let i = 0, l = sources.length; i < l; i++) {
                const {metaOwners} = sources[i]
                metaOwners.push((base: Cacheable))
            }
            break
        }
        default:
            throw new TypeError(
                `Unhandlered dep type: ${target.base.info.displayName}`
            )
    }
}
