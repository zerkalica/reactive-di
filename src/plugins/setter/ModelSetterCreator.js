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
import type {ResolveDepsResult} from '../factory/resolveDeps'
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
export default class ModelSetterCreator<V: Object, E>{
    _meta: MetaDep<E>;
    _assert: (result: Object, info: Info) => void;
    _info: Info;
    _invoker: Invoker<DepFn<V>, FactoryDep>;
    _model: ModelDep<V>|AsyncModelDep<V, E>;

    constructor(
        invoker: Invoker<DepFn<V>, FactoryDep>,
        info: Info,
        model: ModelDep<V>|AsyncModelDep<V, E>,
        meta: MetaDep<E>
    ) {
        this._meta = meta
        this._assert = model.kind === 'asyncmodel' ? assertAsync : assertSync
        this._invoker = invoker
        this._info = info
        this._model = model
    }

    _setterResolver(depsResult: ResolveDepsResult, args: Array<any>): void {
        const {deps, middlewares} = depsResult
        const {_model: model} = this
        const result: V = fastCall(this._invoker.target, [model.resolve()].concat(deps, args));
        if (middlewares) {
            const middleareArgs = [result].concat(args)
            for (let i = 0, l = middlewares.length; i < l; i++) {
                fastCall(middlewares[i], middleareArgs)
            }
        }
        this._assert(result, this._info)
        model.set(result)
    }

    create(): SetFn {
        const self = this
        const {_meta: meta} = this
        const depsResult: ResolveDepsResult = resolveDeps(this._invoker.depArgs);

        return function setValue(...args: any): void {
            if (meta.resolve().fulfilled) {
                self._setterResolver(depsResult, args)
            } else {
                function success(): void {
                    self._setterResolver(depsResult, args)
                }
                meta.promise.then(success)
            }
        }
    }
}
