/* @flow */
import type {
    DepItem,
    DependencyKey,
    RawAnnotation,
    Annotation
} from 'reactive-di/i/coreInterfaces'
import getFunctionName from 'reactive-di/utils/getFunctionName'
import SimpleMap from 'reactive-di/utils/SimpleMap'
import {
    paramtypes,
    rdi
} from 'reactive-di/core/annotationDriver'

export default class AnnotationMap {
    _map: Map<DependencyKey, Annotation>;

    constructor(
        config: Array<RawAnnotation|DependencyKey>
    ) {
        this._map = new SimpleMap()
        for (let i = 0, l = config.length; i < l; i++) {
            const conf = config[i]
            let annotation: RawAnnotation;
            let target: ?DependencyKey;
            if (typeof conf === 'object') {
                annotation = conf
                target = annotation.target
            } else {
                annotation = rdi.get(conf)
                target = conf
            }
            if (!target) {
                throw new Error(`Target not set for annotation: ${Object.keys(annotation)}`)
            }
            const oldAnnotation: ?Annotation = this._map.get(target);
            if (oldAnnotation) {
                throw new Error(`DependencyKey already registered, current: \
    ${oldAnnotation.kind}@${getFunctionName(oldAnnotation.target)}, \
    new: ${annotation.kind}@${getFunctionName(target)}`)
            }
            this.set(target, annotation)
        }
    }

    _normalize(key: Dependency, raw: RawAnnotation): Annotation {
        const target = raw.target || key
        const deps: Array<DepItem> = raw.deps && raw.deps.length
            ? raw.deps
            : (paramtypes.get(target) || []);

        return {
            ...raw,
            kind: raw.kind,
            displayName: raw.kind + '@' + getFunctionName(target),
            target,
            deps,
            tags: raw.tags || []
        }
    }

    set(target: DependencyKey, annotation: any): void {
        this._map.set(target, this._normalize(target, annotation))
    }

    has(target: DependencyKey): boolean {
        return this._map.has(target) && rdi.has(target)
    }

    get(target: DependencyKey): ?Annotation {
        let annotation: ?Annotation = this._map.get(target);
        if (!annotation) {
            const raw: ?RawAnnotation = rdi.get(target);
            if (raw) {
                annotation = this._normalize(target, raw)
                this._map.set(target, annotation)
            }
        }

        return annotation
    }
}
