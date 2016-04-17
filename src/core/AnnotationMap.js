/* @flow */
import type {
    DependencyKey,
    Annotation
} from 'reactive-di/i/coreInterfaces'
import getFunctionName from 'reactive-di/utils/getFunctionName'
import SimpleMap from 'reactive-di/utils/SimpleMap'
import driver from 'reactive-di/core/annotationDriver'

function normalizeAnnotation(annotation: Annotation): Annotation {
    if (!annotation.tags) {
        /* eslint-disable no-param-reassign */
        annotation.tags = []
    }
    if (!annotation.displayName) {
        /* eslint-disable no-param-reassign */
        const fnName: string = getFunctionName(annotation.target);
        annotation.displayName = annotation.kind + '@' + fnName
    }

    return annotation
}

export default class AnnotationMap {
    _map: Map<DependencyKey, Annotation>;

    constructor(
        config: Array<Annotation>
    ) {
        this._map = new SimpleMap()
        for (let i = 0, l = config.length; i < l; i++) {
            const annotation: Annotation = normalizeAnnotation(config[i]);
            const oldAnnotation = this.get(annotation.target, false)
            if (oldAnnotation) {
                throw new Error(`DependencyKey already registered, current: \
    ${oldAnnotation.kind}@${getFunctionName(oldAnnotation.target)}, \
    new: ${annotation.kind}@${getFunctionName(annotation.target)}`)
            }
            this.set(annotation.target, annotation)
        }
    }

    set(target: DependencyKey, value: Annotation): Map<DependencyKey, Annotation> {
        return this._map.set(target, normalizeAnnotation(value))
    }

    has(target: DependencyKey): boolean {
        if (!this._map.has(target)) {
            return !!this._fromDriver(target)
        }

        return true
    }

    _fromDriver(target: DependencyKey): ?Annotation {
        let annotation: ?Annotation;
        const rawAnnotation = driver.getAnnotation(target)
        if (rawAnnotation) {
            annotation = normalizeAnnotation(rawAnnotation)
            this._map.set(target, annotation)
        }

        return annotation
    }

    get(target: DependencyKey): ?Annotation {
        let annotation = this._map.get(target)
        if (!annotation) {
            annotation = this._fromDriver(target)
        }

        return annotation
    }
}
