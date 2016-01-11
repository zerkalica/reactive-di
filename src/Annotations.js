/* @flow */

import createProxy from './utils/createProxy'
import getFunctionName from './utils/getFunctionName'
import AbstractMetaDriver from './meta/drivers/AbstractMetaDriver'
import DepMeta, {createId} from './meta/DepMeta'
import type {DepId, Dependency, Setter, OnUpdateHook} from './interfaces'
/* eslint-disable no-unused-vars */
import type {StateModel} from './model/interfaces'
/* eslint-enable no-unused-vars */
import {AbstractDataCursor, AbstractSelector, promisedSelectorMeta, selectorMeta} from './selectorInterfaces'
import EntityMeta from './promised/EntityMeta'
import PromisedSelector from './promised/PromisedSelector'
import PromisedCursor from './promised/PromisedCursor'

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

function _getter<T: Object>(cursor: AbstractDataCursor<T>): T {
    return cursor.get()
}

function _metaGetter(cursor: PromisedCursor): EntityMeta {
    return cursor.get()
}

function _setter<T: Object>(data: AbstractDataCursor<T>, promised: PromisedCursor): Setter<T> {
    function success(value: T): void {
        const needNotify = !data.set(value)
        promised.success(needNotify)
    }

    function error(reason: Error): void {
        promised.error(reason)
    }

    return function __setter(value: T|Promise<T>): void {
        if (typeof value.then === 'function') {
            promised.pending()
            value.then(success).catch(error)
        } else if (typeof value === 'object') {
            success(value)
        }
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

function createPromisedCursorMeta(id: string, debugName: string, tags: Array<string>): DepMeta {
    function _metaSelect(selector: PromisedSelector): PromisedCursor {
        return selector.select(id)
    }
    _metaSelect.displayName = 'metaSel@' + debugName
    const selectMeta = new DepMeta({
        deps: [promisedSelectorMeta],
        fn: _metaSelect,
        tags: [debugName, 'metaSel'].concat(tags)
    });

    return selectMeta
}

function createMetaGetter(
    id: DepId|DepMeta,
    debugName: string,
    tags: Array<string>,
    driver: AbstractMetaDriver
): (c: PromisedCursor) => EntityMeta {
    const selectMeta: DepMeta = id instanceof DepMeta
        ? id
        : createPromisedCursorMeta(id, debugName, tags);

    const getMetaMeta = new DepMeta({
        deps: [selectMeta],
        fn: _metaGetter,
        tags: [debugName, 'getMeta'].concat(tags)
    })

    function getMeta(cursor: PromisedCursor): EntityMeta {
        return cursor.get()
    }

    driver.set(getMeta, getMetaMeta)
    return getMeta
}

function klass(
    driver: AbstractMetaDriver,
    tags: Array<string>,
    rawDeps: Array<Dependency>
): DepDecoratorFn {
    return function _klass<T>(proto: Dependency<T>): Dependency<T> {
        const debugName: string = getFunctionName((proto: Function));
        const id = createId()
        function createObject(...args: Array<any>): T {
            /* eslint-disable new-cap */
            return new (proto: any)(args[0], args[1], args[2], args[3], args[4], args[5], args[6])
            /* eslint-enable new-cap */
        }
        createObject.displayName = 'klass@' + debugName
        const meta: DepMeta = new DepMeta({
            id,
            ...normalizeDeps(driver, rawDeps),
            fn: createObject,
            getMeta: createMetaGetter(id, debugName, tags, driver),
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
        const debugName: string = getFunctionName(fn);
        const id = createId()
        const meta = new DepMeta({
            id,
            ...normalizeDeps(driver, rawDeps),
            fn,
            getMeta: createMetaGetter(id, debugName, tags, driver),
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
    function _select(selector: AbstractSelector): AbstractDataCursor<T> {
        return selector.select(id)
    }
    _select.displayName = 'sel@' + debugName
    const select = new DepMeta({
        deps: [selectorMeta],
        fn: _select,
        tags: [debugName, 'sel'].concat(tags)
    })
    const promisedCursorMeta = createPromisedCursorMeta(id, debugName, tags)
    const setterMeta = new DepMeta({
        deps: [select, promisedCursorMeta],
        fn: _setter,
        tags: [debugName, 'set'].concat(tags)
    })

    const meta = new DepMeta({
        id,
        fn: _getter,
        deps: [select],
        setter: setterMeta,
        getMeta: createMetaGetter(promisedCursorMeta, debugName, tags, driver),
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
            return setter(driver, tags, dep, rawDeps)
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
