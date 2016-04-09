/* @flow */
import type {
    DependencyKey,
    Annotation
} from 'reactive-di/i/coreInterfaces'
import getFunctionName from 'reactive-di/utils/getFunctionName'
import SimpleMap from 'reactive-di/utils/SimpleMap'

export default function normalizeConfiguration(
    config: Array<Annotation>
): Map<DependencyKey, Annotation> {
    const annotations: Map<DependencyKey, Annotation> = new SimpleMap();

    for (let i = 0, l = config.length; i < l; i++) {
        const annotation: Annotation = config[i];
        const oldAnnotation = annotations.get(annotation.target)
        if (oldAnnotation) {
            throw new Error(`DependencyKey already registered, current: \
${oldAnnotation.kind}@${getFunctionName(oldAnnotation.target)}, \
new: ${annotation.kind}@${getFunctionName(annotation.target)}`)
        }
        annotations.set(annotation.target, annotation)
    }

    return annotations
}
