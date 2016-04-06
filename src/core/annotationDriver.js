/* @flow */
import type {Annotation} from 'reactive-di/i/annotationInterfaces'

const PROP_NAME = '___rdi_meta';

class AnnotationDriver {
    set(annotatedDep: Function, annotation: Annotation): void {
        Object.defineProperty(annotatedDep, PROP_NAME, {
            value: annotation,
            writable: false,
            configurable: false,
            enumerable: false
        })
    }

    get(annotatedDep: Function): Annotation {
        return annotatedDep[PROP_NAME]
    }
}

export default new AnnotationDriver()
