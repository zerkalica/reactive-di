/* @flow */

import {DepBaseImpl} from 'reactive-di/pluginsCommon/pluginImpls'
import type {
    DepId,
    Info
} from 'reactive-di/i/annotationInterfaces'
import type {
    AnyDep,
    DepBase,
    AnnotationResolver
} from 'reactive-di/i/nodeInterfaces'
import type {Plugin} from 'reactive-di/i/pluginInterfaces' // eslint-disable-line
import type {
    ResetDep,
    ResetAnnotation,
    LoaderDep
} from 'reactive-di/i/plugins/loaderInterfaces'

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

    finalize(dep: ResetDep, target: AnyDep): void {} // eslint-disable-line
}
