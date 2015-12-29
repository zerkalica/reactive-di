/* @flow */

import createProxy from './utils/createProxy'
import getFunctionName from './utils/getFunctionName'
import AbstractMetaDriver from './meta/drivers/AbstractMetaDriver'
import DepMeta, {createId} from './meta/DepMeta'
import type {Dependency, Setter, OnUpdateHook} from './interfaces'
/* eslint-disable no-unused-vars */
import type {StateModel} from './model/interfaces'
/* eslint-enable no-unused-vars */
import {AbstractCursor, AbstractSelector, selectorMeta} from './selectorInterfaces'
import EntityMeta from './promised/EntityMeta'

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

function _getter<T: Object>(cursor: AbstractCursor<T>): T {
    return cursor.get()
}

function _setter<T: Object>(cursor: AbstractCursor<T>): Setter<T> {
    return function __setter(value: T|Promise<T>): void {
        cursor.set(value)
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
    function _select(selector: AbstractSelector): AbstractCursor<T> {
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

    function getMeta(cursor: AbstractCursor<T>): EntityMeta {
        return cursor.getMeta()
    }

    const getMetaMeta = new DepMeta({
        deps: [select],
        fn: getMeta,
        tags: [debugName, 'getMeta'].concat(tags)
    })

    driver.set(getMeta, getMetaMeta)

    const meta = new DepMeta({
        id,
        fn: _getter,
        deps: [select],
        setter: setterMeta,
        getMeta,
        tags: [debugName, 'model'].concat(tags)
    })

    return driver.set(mdl, meta)
}

function setter<S: StateModel>(
    driver: AbstractMetaDriver,
    tags: Array<string>,
    dep: Dependency<S>,
    rawDeps: Array<Dependency>
): DepDecoratorFn {
    return function __setter<T>(sourceFn: Dependency<T>): Dependency<T> {
        const debugName: string = getFunctionName((dep: Function));
        const source: DepMeta = new DepMeta({
            ...normalizeDeps(driver, rawDeps),
            fn: sourceFn,
            tags: [debugName, 'source'].concat(tags)
        });
        const {setter: setterMeta} = driver.get(dep)
        if (!setterMeta) {
            throw new Error('Not a model dep: ' + debugName)
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
type MetaFn<T> = (value: Dependency<T>) => Dependency<T>;

export default class Annotations {
    setter: SetterFn;
    model: ModelFn;
    factory: FactoryFn;
    klass: KlassFn;
    meta: MetaFn;

    constructor(driver: AbstractMetaDriver, tags: Array<string> = []) {
        this.setter = function __setter<S: StateModel>(dep: Dependency<S>, ...rawDeps: Array<Dependency>): DepDecoratorFn {
            return setter(driver, tags, dep, rawDeps, false)
        }

        this.meta = function __meta<S: StateModel>(dep: Dependency<S>): Dependency<S> {
            const {getMeta, displayName} = driver.get(dep)
            if (!getMeta) {
                throw new Error('Not a dep model: ' + displayName)
            }
            return getMeta()
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
