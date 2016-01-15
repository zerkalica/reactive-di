/* @flow */

import AbstractMetaDriver from './AbstractMetaDriver'
import RawDepMeta from '../RawDepMeta'
import type {Dependency} from '../../interfaces'

const metaSymbol = Symbol('__rdi__meta')

export default class SymbolMetaDriver extends AbstractMetaDriver {
    /* eslint-disable no-undef */
    has<T>(dep: Class<T>): boolean {
        return !!(dep: Function)[metaSymbol]
    }
    /* eslint-enable no-undef */

    set(dep: Dependency, meta: RawDepMeta): Dependency {
        if ((dep: Function)[metaSymbol]) {
            throw new Error('Annotation already defined for ' + ((dep: Function).displayName || String(dep)))
        }
        (dep: Function)[metaSymbol] = meta
        return dep
    }

    get(dep: Dependency): RawDepMeta {
        const meta: RawDepMeta = (dep: Function)[metaSymbol];
        if (!meta || !(meta instanceof RawDepMeta)) {
            throw new TypeError('Not an annotated dependency: ' + ((dep: Function).displayName || String(dep)))
        }
        return meta
    }
}
