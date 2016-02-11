/* @flow */

import defaultFinalizer from '../factory/defaultFinalizer'
import {DepBaseImpl} from '../../core/pluginImpls'
import type {
    DepId,
    Info
} from '../../interfaces/annotationInterfaces'
import type {
    AnyDep,
    DepBase,
    AnnotationResolver
} from '../../interfaces/nodeInterfaces'
import type {Plugin} from '../../interfaces/pluginInterfaces' // eslint-disable-line
import type {
    ResetDep,
    ResetAnnotation,
    LoaderDep
} from './loaderInterfaces'

// implements ResetDep
class ResetDepImpl<V: () => void> {
    kind: 'reset';
    base: DepBase;
    _value: V;

    constructor(
        id: DepId,
        info: Info,
        loaderDep: LoaderDep<V>
    ) {
        this.kind = 'reset'
        this.base = new DepBaseImpl(id, info)
        function reset(): void {
            loaderDep.reset()
        }
        this._value = ((reset: any): V)
    }

    resolve(): V {
        return this._value
    }
}

// depends on loader
// implements Plugin
export default class ResetPlugin {
    create(annotation: ResetAnnotation, acc: AnnotationResolver): void {
        const {base} = annotation
        const loaderDep: AnyDep = acc.newRoot().resolve(base.target);
        if (loaderDep.kind !== 'loader') {
            throw new Error(
                `Not a loader as target in ${base.info.displayName}`
            )
        }
        const dep: ResetDep = new ResetDepImpl(
            base.id,
            base.info,
            loaderDep
        );
        acc.begin(dep)
        acc.end(dep)
    }

    finalize(dep: ResetDep, target: AnyDep): void {
        defaultFinalizer(dep, target)
    }
}
