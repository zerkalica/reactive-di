/* @flow */

import DepMeta from '../DepMeta'
import type {Dependency} from '../../interfaces'

export default class AbstractMetaDriver {
    /* eslint-disable no-unused-vars, no-undef */
    has<T>(dep: Class<T>): boolean {
        return false
    }

    set(dep: Dependency, meta: DepMeta): Dependency {
        return dep
    }

    get(dep: Dependency): DepMeta {
        return new DepMeta({fn: () => null})
    }
}
