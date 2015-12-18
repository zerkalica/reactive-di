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

function proxifyResult<R: Function>(src: R, set: Setter): R {
    return createProxy(src, [set])
}

function _getter<T>(cursor: AbstractCursor<T>): T {
    return cursor.get()
}

function _setter<T: Object>(cursor: AbstractCursor<T>): Setter<T> {
    return function __setter(value: T): void {
        cursor.set(value)
    }
}

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

function klass(tags: Array<string>, rawDeps: Array<Dependency>): DepDecoratorFn {
    return function _klass<T>(proto: Dependency<T>): Dependency<T> {
        const debugName: string = getFunctionName((proto: Function));
        function createObject(...args: Array<any>): T {
            /* eslint-disable new-cap */
            return new (proto: any)(args[0], args[1], args[2], args[3], args[4], args[5], args[6])
            /* eslint-enable new-cap */
        }
        createObject.displayName = 'klass@' + debugName
        const meta: DepMeta = new DepMeta({
            ...normalizeDeps(rawDeps),
            fn: createObject,
            tags: [debugName, 'klass'].concat(tags)
        });
        return DepMeta.set(proto, meta)
    }
}

function factory(tags: Array<string>, rawDeps: Array<Dependency>): DepDecoratorFn {
    return function _factory<T: Function>(fn: T): Dependency<T> {
        const meta = new DepMeta({
            ...normalizeDeps(rawDeps),
            fn,
            tags: ['factory'].concat(tags)
        })
        return DepMeta.set(fn, meta)
    }
}

function model<T: StateModel>(tags: Array<string>, mdl: Dependency<T>): Dependency<T> {
    const debugName: string = getFunctionName((mdl: Function));
    const id = createId()
    function _select(selector: AbstractSelector): AbstractCursor<T> {
        return selector.select(id)
    }
    _select.displayName = 'sel@' + debugName
    const select = new DepMeta({deps: [DepMeta.get(AbstractSelector)], fn: _select, tags: [debugName, 'sel'].concat(tags)})
    const getter = new DepMeta({deps: [select], fn: _getter, tags: [debugName, 'get'].concat(tags)})
    const setter = new DepMeta({deps: [select], fn: _setter, tags: [debugName, 'set'].concat(tags)})

    const meta = new DepMeta({
        id,
        fn: _getter,
        deps: [select],
        getter,
        setter,
        tags: [debugName, 'model'].concat(tags)
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

function setter<S: StateModel>(
    tags: Array<string>,
    dep: Dependency<S>,
    rawDeps: Array<Dependency>
): DepDecoratorFn {
    return function __setter<T>(sourceFn: Dependency<T>): Dependency<T> {
        const debugName: string = getFunctionName((dep: Function));
        const source: DepMeta = new DepMeta({
            ...normalizeDeps(rawDeps),
            fn: sourceFn,
            tags: [debugName, 'source'].concat(tags)
        });

        const setterMeta = DepMeta.get(dep).setter
        if (!setterMeta) {
            throw new Error('Not a state dependency: ' + debugName)
        }

        const meta: DepMeta = new DepMeta({
            deps: [source, setterMeta],
            fn: proxifyResult,
            tags: [debugName, 'setter'].concat(tags)
        });

        return DepMeta.set(sourceFn, meta)
    }
}

type SetterFn<S> = (dep: Dependency<S>, ...rawDeps: Array<Dependency>) => DepDecoratorFn<S>;
export function createSetter(tags: Array<string> = []): SetterFn {
    return function __setter<S: StateModel>(
        dep: Dependency<S>,
        ...rawDeps: Array<Dependency>
    ): DepDecoratorFn {
        return setter(tags, dep, rawDeps)
    }
}

type ModelFn<T> = (mdl: Dependency<T>) => DepDecoratorFn<T>;
export function createModel(tags: Array<string> = []): ModelFn {
    return function _model<T: StateModel>(mdl: Dependency<T>): Dependency<T> {
        return model(tags, mdl)
    }
}

type FactoryFn<T> = (...rawDeps: Array<Dependency>) => DepDecoratorFn<T>;
export function createFactory(tags: Array<string> = []): FactoryFn {
    return function _factory<T>(...rawDeps: Array<Dependency>): DepDecoratorFn<T> {
        return factory(tags, rawDeps)
    }
}

type KlassFn<T> = (...rawDeps: Array<Dependency>) => DepDecoratorFn<T>;
export function createKlass(tags: Array<string> = []): KlassFn {
    return function _klass<T>(...rawDeps: Array<Dependency>): DepDecoratorFn<T> {
        return klass(tags, rawDeps)
    }
}
