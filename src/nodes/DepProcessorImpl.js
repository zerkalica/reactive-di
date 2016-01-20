/* @flow */

/* eslint-disable no-unused-vars */
import type {
    DepProcessor,
    Cache,
    EntityMeta,
    ProcessorTypeMap,
    AnyDep
} from './nodeInterfaces'
import type {
    Dependency
} from '../annotations/annotationInterfaces'

// implements DepProcessor
export default class DepProcessorImpl {
    _processors: ProcessorTypeMap;

    constructor(processors: ProcessorTypeMap) {
        this._processors = processors
    }

    /* eslint-disable no-unused-vars */
    resolve<A: any, B: Dependency<A>, T: AnyDep<A, B>>(dep: T): A {
    /* eslint-enable no-unused-vars */
        const cache: Cache = dep.cache;
        if (cache.isRecalculate) {
            try {
                this._processors[dep.kind](dep, (this: DepProcessor))
            } catch (e) {
                e.message = e.message + ', ' + dep.info.displayName
                throw e
            }
        }

        return ((cache.value): any)
    }
}
