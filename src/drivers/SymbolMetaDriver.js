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
    set<R, T: Dependency<R>, A: AnyAnnotation>(dep: T, annotation: A): T {
        if ((dep: Function)[metaSymbol]) {
            throw new Error('Annotation already defined for ' + ((dep: Function).displayName || String(dep)))
        }
        (dep: Function)[metaSymbol] = annotation
        return dep
    }

    get<R, T: Dependency<R>, A: AnyAnnotation>(dep: T): A {
        const annotation: A = (dep: Function)[metaSymbol];
        if (!annotation || !annotation.kind) {
            throw new TypeError('Not an annotated dependency: ' + ((dep: Function).displayName || String(dep)))
        }
        return annotation
    }
}
