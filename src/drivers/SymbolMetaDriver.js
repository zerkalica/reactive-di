/* @flow */

import type {
    AnnotationDriver,
    AnyAnnotation,
    Dependency
} from '../annotations/annotationInterfaces'

// const metaSymbol = Symbol('__rdi__meta')
const metaSymbol = '__rdi__meta'

// implements AnnotationDriver
export default class SymbolMetaDriver {
    set<T, D: Dependency<T>, A: AnyAnnotation>(dep: Class<T>, meta: A): D {
        if ((dep: Function)[metaSymbol]) {
            throw new Error('Annotation already defined for ' + ((dep: Function).displayName || String(dep)))
        }
        (dep: Function)[metaSymbol] = meta
        return ((dep: any): D)
    }

    get<T, A: AnyAnnotation>(dep: Dependency<T>): A {
        const meta: A = (dep: Function)[metaSymbol];
        if (!meta || !meta.kind) {
            throw new TypeError('Not an annotated dependency: ' + ((dep: Function).displayName || String(dep)))
        }
        return meta
    }
}
