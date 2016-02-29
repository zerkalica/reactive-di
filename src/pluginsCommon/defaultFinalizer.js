/* @flow */

import type {Cacheable} from 'reactive-di/i/nodeInterfaces'
import type {MetaDep} from 'reactive-di/i/plugins/metaInterfaces'
import type {ModelDep} from 'reactive-di/i/plugins/modelInterfaces'
import type {AsyncSetterDep} from 'reactive-di/i/plugins/setterInterfaces'

export type AnyDep = ModelDep | AsyncSetterDep | MetaDep;

export default function defaultFinalizer(base: Cacheable, target: AnyDep): void {
    switch (target.kind) {
        case 'model':
            target.dataOwners.push(base)
            break
        case 'asyncsetter':
            break
        case 'meta': {
            const {sources} = target
            for (let i = 0, l = sources.length; i < l; i++) {
                const {metaOwners} = sources[i]
                metaOwners.push(base)
            }
            break
        }
        default:
            throw new TypeError(
                `Unhandlered dep type: ${target.base.displayName}`
            )
    }
}
