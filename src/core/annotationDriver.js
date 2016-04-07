/* @flow */
import type {Annotation} from 'reactive-di/i/annotationInterfaces'
import setProp from 'reactive-di/utils/setProp'

const PROP_NAME = '___rdi_meta';

class AnnotationDriver {
    set(annotatedDep: Function, annotation: Annotation): void {
        setProp(annotatedDep, PROP_NAME, annotation)
    }

    get(annotatedDep: Function): Annotation {
        return annotatedDep.___rdi_meta
    }
}

export default new AnnotationDriver()
