/* @flow */
import type {
    Tag,
    DepFn
} from 'reactive-di/i/annotationInterfaces'
import type {FactoryAnnotation} from 'reactive-di/i/pluginsInterfaces'
import type {
    Context,
    ResolvableDep,
    ResolveDepsResult
} from 'reactive-di/i/nodeInterfaces'

import {createFunctionProxy} from 'reactive-di/utils/createProxy'
import {fastCall} from 'reactive-di/utils/fastCall'
import getFunctionName from 'reactive-di/utils/getFunctionName'

export class FactoryDep {
    kind: 'factory';
    displayName: string;
    tags: Array<Tag>;
    isRecalculate: boolean;

    _value: Function;
    _resolver: () => ResolveDepsResult;

    constructor(annotation: FactoryAnnotation) {
        this.kind = 'factory'
        const fnName: string = getFunctionName(annotation.target);
        this.displayName = this.kind + '@' + fnName
        this.tags = [this.kind, fnName]

        this.isRecalculate = false
        const self = this

        function getValue(...args: Array<any>): any {
            const {deps, middlewares} = self._resolver()

            const fn: DepFn = middlewares
                ? createFunctionProxy(annotation.target, middlewares)
                : annotation.target;

            return fastCall(fn, deps.concat(args));
        }

        this._value = getValue
    }

    init(resolver: () => ResolveDepsResult): void {
        this._resolver = resolver
    }

    resolve(): Function {
        return this._value
    }
}

// depends on meta
// implements Plugin
export default class FactoryPlugin {
    kind: 'factory' = 'factory';

    create(annotation: FactoryAnnotation, acc: Context): ResolvableDep { // eslint-disable-line
        return new FactoryDep(annotation);
    }

    finalize(dep: FactoryDep, annotation: FactoryAnnotation, acc: Context): void {
        dep.init(acc.createDepResolver(annotation, dep.tags))
    }
}
