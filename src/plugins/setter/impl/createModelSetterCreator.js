/* @flow */

import resolveDeps from '../../factory/resolveDeps'
import InvokerImpl from '../../factory/InvokerImpl'
import MetaAnnotationImpl from '../../meta/MetaAnnotationImpl'
import type {
    AnnotationBase,
    Deps,
    DepFn,
    Info
} from '../../../interfaces/annotationInterfaces'
import type {
    AnyDep,
    AnnotationResolver
} from '../../../interfaces/nodeInterfaces'
import type {Observable} from '../../../interfaces/observableInterfaces'
import {fastCall} from '../../../utils/fastCall'
import type {AnyUpdater, AsyncModelDep} from '../../asyncmodel/asyncmodelInterfaces'
import type {
    FactoryDep,
    Invoker
} from '../../factory/factoryInterfaces'
import type {ResolveDepsResult} from '../../factory/resolveDeps'
import type {MetaDep} from '../../meta/metaInterfaces'
import type {ModelDep} from '../../model/modelInterfaces'
import type {
    AnyModelDep,
    SetterCreator,
    SetFn
} from '../setterInterfaces'

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

class AsyncModelObservable<V: Object, E> {
    _model: AsyncModelDep<V, E>;
    _notify: () => void;

    constructor(
        model: AsyncModelDep,
        notify: () => void
    ) {
        this._model = model
        this._notify = notify
    }

    next(value: V): void {
        this._model.next(value)
        this._notify()
    }

    error(err: E): void {
        this._model.error(err)
        this._notify()
    }

    complete(): void {
        this._model.unsubscribe()
    }
}

export default function createModelSetterCreator<V: Object, E>(
    notify: () => void,
    meta: MetaDep<E>,
    invoker: Invoker,
    info: Info
): SetterCreator {
    function setterResolver(
        depsResult: ResolveDepsResult,
        model: ModelDep<V>|AsyncModelDep<V, E>,
        args: Array<any>
    ): void {
        const {deps, middlewares} = depsResult
        const result: V = fastCall(invoker.target, [model.resolve()].concat(deps, args));
        if (middlewares) {
            const middleareArgs = [result].concat(args)
            for (let i = 0, l = middlewares.length; i < l; i++) {
                fastCall(middlewares[i], middleareArgs)
            }
        }

        switch (model.kind) {
            case 'model':
                assertSync(result, info)
                model.set(result)
                break
            case 'asyncmodel':
                assertAsync(result, info)
                model.pending()
                this._subscription = (result: Observable<V, E>).subscribe(
                    new AsyncModelObservable(model, notify)
                )
                break
            default:
                throw new Error('Unknown type: ' + model.kind + ' in ' + model.base.info.displayName)
        }
        notify()
    }

    return function createModelSetter(model: AnyModelDep<V, E>): SetFn {
        const depsResult: ResolveDepsResult = resolveDeps(invoker.depArgs);

        return function setValue(...args: any): void {
            if (meta.resolve().fulfilled) {
                setterResolver(depsResult, model, args)
            } else {
                function success(): void {
                    setterResolver(depsResult, model, args)
                }
                meta.promise.then(success)
            }
        }
    }
}
