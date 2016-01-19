/* @flow */

import type {AnyAnnotation} from '../annotations/annotationInterfaces'
import type {Dependency} from '../interfaces'

const metaSymbol = Symbol('__rdi__meta')

export default class SymbolMetaDriver {
    set<T: Function>(dep: T, meta: AnyAnnotation): T {
        if ((dep: Function)[metaSymbol]) {
            throw new Error('Annotation already defined for ' + ((dep: Function).displayName || String(dep)))
        }
        (dep: Function)[metaSymbol] = meta
        return ((dep: any): T)
    }

    get<T: Function, A: AnyAnnotation>(dep: T): A {
        const meta: A = (dep: Function)[metaSymbol];
        if (!meta || !meta.kind) {
            throw new TypeError('Not an annotated dependency: ' + ((dep: Function).displayName || String(dep)))
        }
        return meta
    }
}
