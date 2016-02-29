/* @flow */

import {DepBaseImpl} from 'reactive-di/pluginsCommon/pluginImpls'
import type {
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
class ResetDepImpl {
    kind: 'reset';
    base: DepBase;
    _value: () => void;

    constructor<V: Object, E>(
        annotation: ResetAnnotation<V, E>,
        loaderDep: LoaderDep<V>
    ) {
        this.kind = 'reset'
        this.base = new DepBaseImpl(annotation)
        function reset(): void {
            loaderDep.reset()
        }
        this._value = ((reset: any): V)
    }

    resolve(): () => void {
        return this._value
    }
}

// depends on loader
// implements Plugin
export default class ResetPlugin {
    kind: 'reset' = 'reset';

    create<V: Object, E>(annotation: ResetAnnotation<V, E>, acc: AnnotationResolver): void {
        const loaderDep: LoaderDep<V> = acc.resolve(annotation.target);
        annotation.id = loaderDep.base.id + '.reset' // eslint-disable-line
        if (loaderDep.kind !== 'loader') {
            throw new Error(
                `Not a loader as target in ${loaderDep.base.displayName}`
            )
        }
        const dep: ResetDep = new ResetDepImpl(
            annotation,
            loaderDep
        );
        acc.begin(dep)
        acc.end(dep)
    }

    finalize<Dep: Object>(dep: ResetDep, target: Dep): void {} // eslint-disable-line
}
