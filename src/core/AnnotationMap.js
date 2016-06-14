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
import createIdCreator from 'reactive-di/utils/createIdCreator'

export default class AnnotationMap<Annotation: IAnnotation> {
    _map: Map<DependencyKey, Annotation>;
    _rdi: MetadataDriver<RawAnnotation>;
    _paramtypes: MetadataDriver<Array<DepItem>>;
    _createId: () => string;

    constructor(
        config: Array<ConfigItem>,
        rdi: MetadataDriver<RawAnnotation>,
        paramtypes: MetadataDriver<Array<DepItem>>
    ) {
        this._rdi = rdi
        this._paramtypes = paramtypes
        this._createId = createIdCreator()
        this._map = new SimpleMap()
        this._set(config)
    }

    _set(config: Array<ConfigItem>): void {
        const map = this._map
        const driver = this._rdi
        for (let i = 0, l = config.length; i < l; i++) {
            const conf: ConfigItem = config[i]

            let raw: ?RawAnnotation
            let key: ?DependencyKey
            let target: ?Dependency
            let def: ?RawAnnotation|Dependency;
            if (Array.isArray(conf)) {
                key = conf[0]
                def = conf[1]
            } else {
                key = conf
                def = conf
            }
            if (typeof def === 'function') {
                raw = driver.get(def)
                target = raw.target || def
            } else {
                raw = def
                target = raw.target || (typeof key === 'function' ? key : null)
            }
            if (target && typeof target !== 'function') {
                throw new Error(`Need function or object, given ${def}, ${getFunctionName(raw)}`)
            }

            if (!raw) {
                throw new Error(`Can't find annotation: ${conf}`)
            }
            if (!raw.kind) {
                throw new Error(`Can't find annotation type: ${getFunctionName(raw)}`)
            }
            if (!key) {
                throw new Error(`Can't find annotation target: ${raw.kind}`)
            }
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
        let deps: Array<DepItem> = raw.deps || []
        if (!deps.length && target) {
            deps = this._paramtypes.get(target) || []
        }
        const dn = getFunctionName(target)
        const annotation: Annotation = {
            ...(raw: any),
            level: raw.level || 0,
            strategy: raw.strategy || 'down',
            kind: raw.kind,
            displayName: raw.kind + '@' + dn,
            target,
            deps,
            tags: raw.tags || []
        }

        return annotation
    }

    getFromDriver(key: DependencyKey): ?Annotation {
        if (typeof key !== 'function') {
            return null
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
