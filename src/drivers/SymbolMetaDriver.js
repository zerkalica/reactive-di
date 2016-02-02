/* @flow */

import type {
    AnnotationDriver,
    AnyAnnotation,
    Dependency
} from '../interfaces/annotationInterfaces'

const metaSymbol = typeof Symbol !== 'undefined' ? Symbol('__rdi__meta') : '__rdi__meta'

// implements AnnotationDriver
export default class SymbolMetaDriver {
    annotate<V, T: Dependency<V>, A: AnyAnnotation>(dep: T, annotation: A): T {
        if ((dep: Function)[metaSymbol]) {
            throw new Error('Annotation already defined for ' + ((dep: Function).displayName || String(dep)))
        }
        (dep: Function)[metaSymbol] = annotation
        return dep
    }

    getAnnotation<V, A: AnyAnnotation>(dep: Dependency<V>): A {
        const annotation: A = (dep: Function)[metaSymbol];
        if (!annotation || !annotation.kind) {
            throw new TypeError('Can\'t get not annotated dependency: ' + ((dep: Function).displayName || String(dep)))
        }
        return annotation
    }
}
