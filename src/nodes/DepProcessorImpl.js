/* @flow */

/* eslint-disable no-unused-vars */
import type {
    DepProcessor,
    AnyDep,
    EntityMeta,
    ProcessorTypeMap
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
    resolve(dep: AnyDep): any {
        const {base} = dep
    /* eslint-enable no-unused-vars */
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
