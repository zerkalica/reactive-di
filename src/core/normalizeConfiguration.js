/* @flow */
import type {
    Tag,
    Dependency,
    Annotation
} from 'reactive-di/i/annotationInterfaces'
import type {MiddlewareAnnotation} from 'reactive-di/i/pluginsInterfaces'
import getFunctionName from 'reactive-di/utils/getFunctionName'
import SimpleMap from 'reactive-di/utils/SimpleMap'

export default function normalizeConfiguration(
    config: Array<Annotation>
): {
    annotations: Map<Dependency, Annotation>;
    middlewares: Map<Tag|Dependency, Array<Dependency>>;
} {
    const annotations: Map<Dependency, Annotation> = new SimpleMap();
    const middlewares: Map<Tag|Dependency, Array<Dependency>> = new SimpleMap();

    for (let i = 0, l = config.length; i < l; i++) {
        const annotation: Annotation|MiddlewareAnnotation = config[i];
        if (annotation.kind === 'middleware') {
            const sources: ?Array<Tag|Dependency> = (annotation: any).sources;
            if (sources) {
                for (let j = 0, k = sources.length; j < k; j++) {
                    const source = sources[j]
                    let meta: ?Array<Dependency> = middlewares.get(source);
                    if (!meta) {
                        meta = []
                        middlewares.set(source, meta)
                    }
                    meta.push(annotation.target)
                }
            }
        } else {
            const oldAnnotation = annotations.get(annotation.target)
            if (oldAnnotation) {
                throw new Error(`Dependency already registered, current: \
${oldAnnotation.kind}@${getFunctionName(oldAnnotation.target)}, \
new: ${annotation.kind}@${getFunctionName(annotation.target)}`)
            }
            annotations.set(annotation.target, annotation)
        }
    }

    return {annotations, middlewares}
}
