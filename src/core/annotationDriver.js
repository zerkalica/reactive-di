/* @flow */
import type {
    Annotation,
    Dependency
} from 'reactive-di/i/coreInterfaces'
import setProp from 'reactive-di/utils/setProp'

class AnnotationDriver {
    annotate<Ann: Annotation>(annotatedDep: Dependency, annotation: Ann): void {
        setProp(annotatedDep, '___rdi_meta', annotation)
    }

    getAnnotation(annotatedDep: Dependency): Annotation {
        return annotatedDep.___rdi_meta
    }
}

export default new AnnotationDriver()
