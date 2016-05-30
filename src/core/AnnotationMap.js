/* @flow */

import type {
    MetadataDriver,
    DepItem,
    Dependency,
    DependencyKey,
    ConfigItem,
    RawAnnotation,
    Annotation as IAnnotation
} from 'reactive-di'

import getFunctionName from 'reactive-di/utils/getFunctionName'
import SimpleMap from 'reactive-di/utils/SimpleMap'

export default class AnnotationMap<Annotation: IAnnotation> {
    _map: Map<DependencyKey, Annotation>;
    _rdi: MetadataDriver<RawAnnotation>;
    _paramtypes: MetadataDriver<Array<DepItem>>;

    constructor(
        config: Array<ConfigItem>,
        rdi: MetadataDriver<RawAnnotation>,
        paramtypes: MetadataDriver<Array<DepItem>>
    ) {
        this._rdi = rdi
        this._paramtypes = paramtypes
        this._map = new SimpleMap()
        this.set(config)
    }

    set(config: Array<ConfigItem>): void {
        const map = this._map
        const driver = this._rdi
        for (let i = 0, l = config.length; i < l; i++) {
            let conf: ConfigItem = config[i]

            let raw: ?RawAnnotation
            let key: ?DependencyKey
            let target: ?Dependency

            if (Array.isArray(conf)) {
                key = conf[0]
                conf = conf[1]
            }

            if (typeof conf === 'object') {
                raw = conf
                target = raw.target
            } else if (typeof conf === 'function') {
                raw = driver.get(conf)
                target = conf
            }

            if (!raw) {
                throw new Error(`Can't find annotation: ${conf}`)
            }
            if (!target) {
                throw new Error(`Can't find annotation target: ${raw.kind}`)
            }

            key = key || (target: DependencyKey)

            const oldAnnotation: ?Annotation = map.get(key)
            if (oldAnnotation) {
                throw new Error(`DependencyKey already registered, current: \
    ${oldAnnotation.kind}@${getFunctionName(oldAnnotation.target)}, \
    new: ${raw.kind}@${getFunctionName(target)}`)
            }

            map.set(key, this._createAnotation(target, raw))
        }
    }

    _createAnotation<R: RawAnnotation>(target: Dependency, raw: R): Annotation {
        const deps: Array<DepItem> = raw.deps && raw.deps.length
            ? raw.deps
            : (this._paramtypes.get(target) || [])

        const annotation: Annotation = {
            ...(raw: any),
            kind: raw.kind,
            displayName: raw.kind + '@' + getFunctionName(target),
            target,
            deps,
            tags: raw.tags || []
        }

        return annotation
    }

    getFromDriver(key: DependencyKey): ?Annotation {
        if (typeof key !== 'function') {
            throw new Error(`Can't get annotation fron non-function`)
        }
        let annotation: ?Annotation
        const raw: ?RawAnnotation = this._rdi.get(key)
        if (raw) {
            annotation = this._createAnotation(key, raw)
            this._map.set(key, annotation)
        }

        return annotation
    }

    get(key: DependencyKey): ?Annotation {
        return this._map.get(key)
    }
}
