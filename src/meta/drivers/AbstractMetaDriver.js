/* @flow */

import RawDepMeta from '../RawDepMeta'
import type {Dependency} from '../../interfaces'

export default class AbstractMetaDriver {
    /* eslint-disable no-unused-vars, no-undef */
    has<T>(dep: Class<T>): boolean {
        return false
    }

    set(dep: Dependency, meta: RawDepMeta): Dependency {
        return dep
    }

    get(dep: Dependency): RawDepMeta {
        return new RawDepMeta({fn: () => null})
    }
}
