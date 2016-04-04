/* @flow */
import type {
    Tag,
    Dependency,
    Annotation
} from 'reactive-di/i/annotationInterfaces'
import type {MiddlewareAnnotation} from 'reactive-di/i/pluginsInterfaces'

export default function normalizeConfiguration(
    config: Array<Annotation>
): {
    annotations: Map<Dependency, Annotation>;
    middlewares: Map<Tag|Dependency, Array<Dependency>>;
} {
    const annotations: Map<Dependency, Annotation> = new Map();
    const middlewares: Map<Tag|Dependency, Array<Dependency>> = new Map();

    for (let i = 0, l = config.length; i < l; i++) {
        const annotation: Annotation|MiddlewareAnnotation = config[i];
        const oldAnnotation = annotations.get(annotation.target)
        if (oldAnnotation) {
            throw new Error(`Dependency already registered, current: ${oldAnnotation.kind}`)
        }
        if (annotation.kind === 'middleware') {
            let sources = middlewares.get(annotation.target)
            if (!sources) {
                sources = []
            }
            middlewares.set(annotation.target, sources.concat((annotation: any).sources))
        } else {
            annotations.set(annotation.target, annotation)
        }
    }

    return {annotations, middlewares}
}
