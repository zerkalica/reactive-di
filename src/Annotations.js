/* @flow */

import createProxy from './utils/createProxy'
import getFunctionName from './utils/getFunctionName'
import AbstractMetaDriver from './meta/drivers/AbstractMetaDriver'
import DepMeta, {createId} from './meta/DepMeta'
import type {Dependency, Setter, OnUpdateHook} from './interfaces'
/* eslint-disable no-unused-vars */
import type {StateModel} from './model/interfaces'
/* eslint-enable no-unused-vars */
import {Cursors, AbstractSelector, selectorMeta} from './selectorInterfaces'

type DepDecoratorFn<T> = (target: Dependency<T>) => T;

type NormalizedDeps = {
    deps: Array<DepMeta>,
    depNames: ?Array<string>,
    onUpdate: ?OnUpdateHook
};

type RawDepMap = {[arg: string]: Dependency};

function proxifyResult<R: Function>(src: R, set: Setter): R {
    return createProxy(src, [set])
}

function _getter<T: Object>(cursor: Cursors<T>): T {
    return cursor.data.get()
}

function _setter<T: Object>(cursor: Cursors<T>): Setter<T> {
    return function __setter(value: T): void {
        cursor.data.set(value)
    }
}

function _asyncSetter<T: Object, P: Promise<T>>(cursor: Cursors<T>): Setter<P> {
    function success(value: T) {
        cursor.data.set(value)
        cursor.promised.success(value)
    }

    function error(reason: Error) {
        cursor.promised.error(reason)
    }

    return function __asyncSetter(value: P): void {
        cursor.promised.pending()
        value.then(success).catch(error)
    }
}

function normalizeDeps(
    driver: AbstractMetaDriver,
    rDeps: Array<Object>
): NormalizedDeps {
    const deps: Array<DepMeta> = [];
    let depNames: ?Array<string> = null;
    let onUpdate: ?OnUpdateHook = null;

    if (typeof rDeps[0] === 'function' && !driver.has(rDeps[0])) {
        onUpdate = rDeps[0]
        /* eslint-disable no-param-reassign */
        rDeps = rDeps.slice(0, 1)
        /* eslint-enable no-param-reassign */
    }

    if (rDeps.length === 1 && typeof rDeps[0] === 'object') {
        const depsMap: RawDepMap = rDeps[0];
        depNames = Object.keys(depsMap)
        for (let i = 0, j = depNames.length; i < j; i++) {
            deps.push(driver.get(depsMap[depNames[i]]))
        }
    } else {
        const rawDeps: Array<Dependency> = rDeps;
        for (let i = 0, j = rawDeps.length; i < j; i++) {
            deps.push(driver.get(rawDeps[i]))
        }
    }

    return {
        deps,
        depNames,
        onUpdate
    }
}

function klass(
    driver: AbstractMetaDriver,
    tags: Array<string>,
    rawDeps: Array<Dependency>
): DepDecoratorFn {
    return function _klass<T>(proto: Dependency<T>): Dependency<T> {
        const debugName: string = getFunctionName((proto: Function));
        function createObject(...args: Array<any>): T {
            /* eslint-disable new-cap */
            return new (proto: any)(args[0], args[1], args[2], args[3], args[4], args[5], args[6])
            /* eslint-enable new-cap */
        }
        createObject.displayName = 'klass@' + debugName
        const meta: DepMeta = new DepMeta({
            ...normalizeDeps(driver, rawDeps),
            fn: createObject,
            tags: [debugName, 'klass'].concat(tags)
        });
        return driver.set(proto, meta)
    }
}

function factory(
    driver: AbstractMetaDriver,
    tags: Array<string>,
    rawDeps: Array<Dependency>
): DepDecoratorFn {
    return function _factory<T: Function>(fn: T): Dependency<T> {
        const meta = new DepMeta({
            ...normalizeDeps(driver, rawDeps),
            fn,
            tags: ['factory'].concat(tags)
        })
        return driver.set(fn, meta)
    }
}

function model<T: StateModel>(
    driver: AbstractMetaDriver,
    tags: Array<string>,
    mdl: Dependency<T>
): Dependency<T> {
    const debugName: string = getFunctionName((mdl: Function));
    const id = createId()
    function _select(selector: AbstractSelector): Cursors<T> {
        return selector.select(id)
    }
    _select.displayName = 'sel@' + debugName
    const select = new DepMeta({
        deps: [selectorMeta],
        fn: _select,
        tags: [debugName, 'sel'].concat(tags)
    })
    const setterMeta = new DepMeta({
        deps: [select],
        fn: _setter,
        tags: [debugName, 'set'].concat(tags)
    })

    const asyncSetterMeta = new DepMeta({
        deps: [select],
        fn: _asyncSetter,
        tags: [debugName, 'asyncSet'].concat(tags)
    })

    const meta = new DepMeta({
        id,
        fn: _getter,
        deps: [select],
        setter: setterMeta,
        asyncSetter: asyncSetterMeta,
        tags: [debugName, 'model'].concat(tags)
    })

    return driver.set(mdl, meta)
}

function setter<S: StateModel>(
    driver: AbstractMetaDriver,
    tags: Array<string>,
    dep: Dependency<S>,
    rawDeps: Array<Dependency>,
    isAsync: boolean
): DepDecoratorFn {
    return function __setter<T>(sourceFn: Dependency<T>): Dependency<T> {
        const debugName: string = getFunctionName((dep: Function));
        const source: DepMeta = new DepMeta({
            ...normalizeDeps(driver, rawDeps),
            fn: sourceFn,
            tags: [debugName, 'source'].concat(tags)
        });
        const depMeta = driver.get(dep)
        const setterMeta = isAsync ? depMeta.asyncSetter : depMeta.setter
        if (!setterMeta) {
            throw new Error('Not a state dependency: ' + debugName)
        }

        const meta: DepMeta = new DepMeta({
            deps: [source, setterMeta],
            fn: proxifyResult,
            tags: [debugName, 'setter'].concat(tags)
        });

        return driver.set(sourceFn, meta)
    }
}

type SetterFn<S> = (dep: Dependency<S>, ...rawDeps: Array<Dependency>) => DepDecoratorFn<S>;
type ModelFn<T> = (mdl: Dependency<T>) => DepDecoratorFn<T>;
type FactoryFn<T> = (...rawDeps: Array<Dependency>) => DepDecoratorFn<T>;
type KlassFn<T> = (...rawDeps: Array<Dependency>) => DepDecoratorFn<T>;

export default class Annotations {
    setter: SetterFn;
    asyncSetter: SetterFn;
    model: ModelFn;
    factory: FactoryFn;
    klass: KlassFn;

    constructor(driver: AbstractMetaDriver, tags: Array<string> = []) {
        this.setter = function __setter<S: StateModel>(dep: Dependency<S>, ...rawDeps: Array<Dependency>): DepDecoratorFn {
            return setter(driver, tags, dep, rawDeps, false)
        }

        this.asyncSetter = function __setter<S: StateModel>(dep: Dependency<S>, ...rawDeps: Array<Dependency>): DepDecoratorFn {
            return setter(driver, tags, dep, rawDeps, true)
        }

        this.model = function __model<T: StateModel>(mdl: Dependency<T>): Dependency<T> {
            return model(driver, tags, mdl)
        }

        this.factory = function __factory<T>(...rawDeps: Array<Dependency>): DepDecoratorFn<T> {
            return factory(driver, tags, rawDeps)
        }

        this.klass = function __klass<T>(...rawDeps: Array<Dependency>): DepDecoratorFn<T> {
            return klass(driver, tags, rawDeps)
        }
    }
}
