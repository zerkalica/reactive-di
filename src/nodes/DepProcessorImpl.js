/* @flow */

/* eslint-disable no-unused-vars */
import type {
    DepProcessor,
    DepBase,
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
    resolve<V: any, E>(dep: AnyDep<V, E>): V {
    /* eslint-enable no-unused-vars */
        const base = dep.base;
        const value: V = base.value;
        if (base.isRecalculate) {
            try {
                this._processors[dep.kind](dep, (this: DepProcessor))
            } catch (e) {
                e.message = e.message + ', ' + base.info.displayName
                throw e
            }
        }

        return base.value
    }
}
