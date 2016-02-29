/* @flow */

import resolveDeps from 'reactive-di/pluginsCommon/resolveDeps'
import DepsResolverImpl from 'reactive-di/pluginsCommon/DepsResolverImpl'
import type {
    Dependency,
    Tag,
    DepItem
} from 'reactive-di/i/annotationInterfaces'
import type {
    DepArgs,
    Invoker,
    AnnotationResolver
} from 'reactive-di/i/nodeInterfaces'
import type {ModelDep} from 'reactive-di/i/plugins/modelInterfaces'
import type {ResolveDepsResult} from 'reactive-di/pluginsCommon/resolveDeps'
import {fastCall} from 'reactive-di/utils/fastCall'

// implements Invoker
class SetterInvoker<Result> {
    _depArgs: DepArgs;
    _target: Dependency;
    _model: ModelDep;

    constructor<V: Object>(
        deps: DepArgs,
        target: Dependency,
        model: ModelDep<V>
    ) {
        this._depArgs = deps
        this._target = target
        this._model = model
    }

    invoke(args: Array<any>): Result {
        const {deps, middlewares}: ResolveDepsResult = resolveDeps(this._depArgs); // eslint-disable-line
        const result: Result = fastCall(this._target, [this._model.resolve()].concat(deps, args));
        if (middlewares) {
            const middleareArgs = [result].concat(args)
            for (let i = 0, l = middlewares.length; i < l; i++) {
                fastCall(middlewares[i], middleareArgs)
            }
        }

        return result
    }
}

export default function createSetterInvoker<V: Object, I>(
    target: Dependency,
    deps: Array<DepItem>,
    tags: Array<Tag>,
    model: ModelDep<V>,
    acc: AnnotationResolver
): Invoker<I> {
    const resolver = new DepsResolverImpl(acc)
    const depArgs: DepArgs = resolver.getDeps(
        deps,
        target,
        tags
    );

    return new SetterInvoker(depArgs, target, model)
}
