/* @flow */

import resolveDeps from '../factory/resolveDeps'
import type {
    DepFn,
    DepId,
    Info
} from '../../interfaces/annotationInterfaces'
import type {Observable} from '../../interfaces/observableInterfaces'
import {fastCall} from '../../utils/fastCall'
import type {AsyncModelDep} from '../asyncmodel/asyncmodelInterfaces'
import type {
    FactoryDep,
    Invoker
} from '../factory/factoryInterfaces'
import type {MetaDep} from '../meta/metaInterfaces'
import type {ModelDep} from '../model/modelInterfaces'
import type {SetFn} from './setterInterfaces'

function isObservable(data: Object): boolean {
    return !!(data.subscribe)
}

function assertAsync(result: Object, info: Info): void  {
    if (!isObservable(result)) {
        throw new Error(`${info.displayName} must return observable`)
    }
}

function assertSync(result: Object, info: Info): void {
    if (isObservable(result)) {
        throw new Error(`${info.displayName} must return raw value, not observable`)
    }
}

// implements Setter
export default function createModelSetter<V: Object, E>(
    invoker: Invoker<DepFn<V>, FactoryDep>,
    info: Info,
    model: ModelDep<V>|AsyncModelDep<V, E>,
    meta: MetaDep<E>
): SetFn {
    const assert = model.kind === 'asyncmodel' ? assertAsync : assertSync

    function setterResolver(args: Array<any>): void {
        const {deps, middlewares} = resolveDeps(invoker.depArgs)
        const result: V = fastCall(invoker.target, [model.resolve()].concat(deps, args));
        if (middlewares) {
            const middleareArgs = [result].concat(args)
            for (let i = 0, l = middlewares.length; i < l; i++) {
                fastCall(middlewares[i], middleareArgs)
            }
        }
        assert(result, info)
        model.set(result)
    }

    return function setValue(...args: any): void {
        if (meta.resolve().fulfilled) {
            setterResolver(args)
        } else {
            function success(): void {
                setterResolver(args)
            }
            meta.promise.then(success)
        }
    }
}
