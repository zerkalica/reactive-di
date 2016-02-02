/* @flow */

import defaultFinalizer from '../factory/defaultFinalizer'
import resolveDeps from '../factory/resolveDeps'
import InvokerImpl from '../factory/InvokerImpl'
import MetaAnnotationImpl from '../meta/MetaAnnotationImpl'
import {DepBaseImpl} from '../../core/pluginImpls'
import type {
    DepFn,
    DepId,
    Info
} from '../../interfaces/annotationInterfaces'
import type {
    DepArgs,
    AnyDep,
    DepBase,
    AnnotationResolver
} from '../../interfaces/nodeInterfaces'
import type {Observable} from '../../interfaces/observableInterfaces'
import type {Plugin} from '../../interfaces/pluginInterfaces'
import {createFunctionProxy} from '../../utils/createProxy'
import {fastCall} from '../../utils/fastCall'
import type {FactoryDep} from '../factory/factoryInterfaces'
import type {AnyModelDep} from '../model/modelInterfaces'
import type {
    SetterResult,
    SetterDep,
    SetterAnnotation,
    SetterInvoker
} from './setterInterfaces'
import type {MetaDep} from '../meta/metaInterfaces'

// implements SetterDep
export class SetterDepImpl<V: Object, E> {
    kind: 'setter';
    base: DepBase;

    _invoker: SetterInvoker<V>;
    _value: (...args: any) => void;
    _model: AnyModelDep<V, E>;
    _metaDep: MetaDep<E>;

    constructor(
        id: DepId,
        info: Info,
        target: DepFn<SetterResult<V>>,
        model: AnyModelDep<V, E>
    ) {
        this.kind = 'setter'
        this.base = new DepBaseImpl(id, info)

        this._invoker = new InvokerImpl(target)
        this._model = model
    }

    resolve(): (...args: any) => void {
        if (!this.base.isRecalculate) {
            return this._value
        }

        const {_invoker: invoker, _model: model, _metaDep: metaDep} = this

        function setter(...args: any): void {
            function setterResolver() {
                const {deps, middlewares} = resolveDeps(invoker.depArgs)
                const result = fastCall(invoker.target, [model.resolve()].concat(deps, args))
                // console.log(111, result)
                if (middlewares) {
                    const middleareArgs = [result].concat(args)
                    for (let i = 0, l = middlewares.length; i < l; i++) {
                        fastCall(middlewares[i], middleareArgs)
                    }
                }
                model.set(result)
            }
            if (metaDep.resolve().fulfilled) {
                setterResolver()
            } else {
                metaDep.promise.then(setterResolver)
            }
        }

        this.base.isRecalculate = false
        this._value = setter

        return setter
    }

    setDepArgs(depArgs: DepArgs, metaDep: MetaDep<E>): void {
        this._invoker.depArgs = depArgs
        this._metaDep = metaDep
    }
}

// depends on factory, model
// implements Plugin
export default class SetterPlugin {
    create<V: Object, E>(annotation: SetterAnnotation<V>, acc: AnnotationResolver): void {
        const {base} = annotation
        const modelDep: AnyDep = acc.newRoot().resolve(annotation.model);
        if (modelDep.kind !== 'model' && modelDep.kind !== 'asyncmodel') {
            throw new Error('Not a model dep type: ' + modelDep.kind)
        }
        const dep: SetterDep<V, E> = new SetterDepImpl(
            base.id,
            base.info,
            base.target,
            modelDep
        );
        acc.begin(dep)
        const deps = acc.getDeps(annotation.deps, base.target, base.info.tags)
        acc.end(dep)

        const metaDep: AnyDep = acc.newRoot().resolveAnnotation(new MetaAnnotationImpl(
            base.target,
            base.info.tags
        ));
        if (metaDep.kind !== 'meta') {
            throw new Error('Not a meta type: ' + metaDep.kind)
        }
        dep.setDepArgs(dep, metaDep)
    }

    finalize(dep: FactoryDep, target: AnyDep): void {
        defaultFinalizer(dep, target)
    }
}
