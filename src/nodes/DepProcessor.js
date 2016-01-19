/* @flow */

/* eslint-disable no-unused-vars */
import type {ProcessorTypeMap, AnyDep} from './nodeInterfaces'
/* eslint-enable no-unused-vars */

export default class DepProcessor {
    _processors: ProcessorTypeMap;

    constructor(processors: ProcessorTypeMap) {
        this._processors = processors
    }

    resolve<T: AnyDep>(dep: T): any {
        const cache = dep.cache
        if (!cache.isRecalculate) {
            return cache.value
        }
        try {
            this._processors[dep.kind](dep, this)
        } catch (e) {
            e.message = e.message + ', ' + dep.info.displayName
            throw e
        }

        return cache.value
    }
}
