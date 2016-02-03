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
import type {SetterCreator, SetFn} from '../setterInterfaces'

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

function createSetterCreator<V: Object, E>(
    invoker: Invoker<DepFn<V>, FactoryDep>,
    info: Info,
    model: ModelDep<V>|AsyncModelDep<V, E>,
    meta: MetaDep<E>
): SetterCreator {
    const assert = model.kind === 'asyncmodel' ? assertAsync : assertSync

    function setterResolver(depsResult: ResolveDepsResult, args: Array<any>): void {
        const {deps, middlewares} = depsResult
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

    return function createModelSetter(): SetFn {
        const depsResult: ResolveDepsResult = resolveDeps(invoker.depArgs);

        return function setValue(...args: any): void {
            if (meta.resolve().fulfilled) {
                setterResolver(depsResult, args)
            } else {
                function success(): void {
                    setterResolver(depsResult, args)
                }
                meta.promise.then(success)
            }
        }
    }
}

export default function createModelSetterCreator<V: Object, E>(
    acc: AnnotationResolver,
    model: Class<V>,
    base: AnnotationBase<AnyUpdater<V, E>>,
    deps: ?Deps,
): SetterCreator {
    const {info, id, target} = base
    const newAcc = acc.newRoot()

    const modelDep: AnyDep = (newAcc.resolve(model) : any);
    if (modelDep.kind !== 'model' && modelDep.kind !== 'asyncmodel') {
        throw new Error('Not a model dep type: ' + modelDep.kind + ' in ' + modelDep.base.info.displayName)
    }

    const metaDep: MetaDep<E> = (newAcc.resolveAnnotation(new MetaAnnotationImpl(
        id + '.meta',
        target,
        info.tags
    )): any);

    const invoker = new InvokerImpl(target, acc.getDeps(deps, target, info.tags));

    return createSetterCreator(
        invoker,
        info,
        modelDep,
        metaDep
    )
}
