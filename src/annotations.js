/* @flow */

import createProxy from './utils/createProxy'
import getFunctionName from './utils/getFunctionName'
import DepMeta, {createId} from './meta/DepMeta'
import {AbstractCursor, AbstractSelector} from './selectorInterfaces'
import type {Dependency, Setter} from './interfaces'
/* eslint-disable no-unused-vars */
import type {StateModel} from './model/interfaces'
/* eslint-enable no-unused-vars */
type DepDecoratorFn<T> = (target: Dependency<T>) => T;

type NormalizedDeps = {
    deps: Array<DepMeta>,
    depNames: ?Array<string>
};

type RawDepMap = {[arg: string]: Dependency};

function normalizeDeps(rDeps: Array<Object>): NormalizedDeps {
    const deps: Array<DepMeta> = [];
    let depNames: ?Array<string> = null;
    if (rDeps.length === 1 && typeof rDeps[0] === 'object') {
        const depsMap: RawDepMap = rDeps[0];
        depNames = Object.keys(depsMap)
        for (let i = 0, j = depNames.length; i < j; i++) {
            deps.push(DepMeta.get(depsMap[depNames[i]]))
        }
    } else {
        const rawDeps: Array<Dependency> = rDeps;
        for (let i = 0, j = rawDeps.length; i < j; i++) {
            deps.push(DepMeta.get(rawDeps[i]))
        }
    }

    return {
        deps,
        depNames
    }
}

export function klass(...rawDeps: Array<Dependency>): DepDecoratorFn {
    return function _klass<T>(proto: Dependency<T>): Dependency<T> {
        function fn(...args: Array<any>): T {
            /* eslint-disable new-cap */
            return new (proto: any)(args[0], args[1], args[2], args[3], args[4], args[5], args[6])
            /* eslint-enable new-cap */
        }
        fn.displayName = 'klass@' + getFunctionName((proto: Function))
        const meta: DepMeta = new DepMeta({
            ...normalizeDeps(rawDeps),
            fn,
            tags: ['class']
        });
        return DepMeta.set(proto, meta)
    }
}

export function factory(...rawDeps: Array<Dependency>): DepDecoratorFn {
    return function _factory<T: Function>(fn: T): Dependency<T> {
        const meta = new DepMeta({
            ...normalizeDeps(rawDeps),
            fn,
            tags: ['factory']
        })
        return DepMeta.set(fn, meta)
    }
}

export function model<T: StateModel>(mdl: Dependency<T>): Dependency<T> {
    const debugName: string = getFunctionName((mdl: Function));
    const id = createId()

    function _select(selector: AbstractSelector): AbstractCursor<T> {
        return selector.select(id)
    }
    _select.displayName = 'select@' + debugName
    const select = new DepMeta({deps: [DepMeta.get(AbstractSelector)], fn: _select})

    function _getter(cursor: AbstractCursor<T>): T {
        return cursor.get()
    }
    _getter.displayName = 'getter@' + debugName
    const getter = new DepMeta({deps: [select], fn: _getter})

    function _setter(cursor: AbstractCursor<T>): Setter<T> {
        return function __setter(value: T): void {
            cursor.set(value)
        }
    }
    _setter.displayName = 'setter@' + debugName
    const setter = new DepMeta({deps: [select], fn: _setter})

    const meta = new DepMeta({
        id,
        fn: _getter,
        deps: [select],
        getter,
        setter,
        tags: ['model']
    })

    return DepMeta.set(mdl, meta)
}

export function nonReactive<T: StateModel>(dep: Dependency<T>): Function {
    const {displayName, getter} = DepMeta.get(dep)
    function fn() {}
    fn.displayName = 'nonReactiveGetter@' + displayName
    if (!getter) {
        throw new Error('Not a state dependency: ' + displayName)
    }
    DepMeta.set(fn, getter)
    return fn;
}

export function set<S: StateModel>(
    dep: Dependency<S>,
    ...rawDeps: Array<Dependency>
): DepDecoratorFn {
    return function _set<T>(sourceFn: Dependency<T>): Dependency<T> {
        const debugName: string = getFunctionName((dep: Function));
        const source: DepMeta = new DepMeta({
            ...normalizeDeps(rawDeps),
            fn: sourceFn
        });

        const {setter} = DepMeta.get(dep);
        if (!setter) {
            throw new Error('Not a state dependency: ' + debugName)
        }
        function proxifyResult<R: Function>(src: R, _setter: Setter): R {
            return createProxy(src, [_setter])
        }
        proxifyResult.displayName = 'setter@' + debugName

        const meta: DepMeta = new DepMeta({
            deps: [source, setter],
            fn: proxifyResult,
            tags: ['setter']
        });

        return DepMeta.set(sourceFn, meta)
    }
}
