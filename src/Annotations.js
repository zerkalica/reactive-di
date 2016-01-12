/* @flow */

import createProxy from './utils/createProxy'
import getFunctionName from './utils/getFunctionName'
import AbstractMetaDriver from './meta/drivers/AbstractMetaDriver'
import CacheRec from './cache/CacheRec'
import EntityMeta from './meta/EntityMeta'
import DepMeta, {createId} from './meta/DepMeta'
import type {Dependency, OnUpdateHook} from './interfaces'
/* eslint-disable no-unused-vars */
import type {StateModel} from './model/interfaces'
/* eslint-enable no-unused-vars */

type DepDecoratorFn<T> = (target: Dependency<T>) => T;

type NormalizedDeps = {
    deps: Array<DepMeta>,
    depNames: ?Array<string>,
    onUpdate: ?OnUpdateHook
};

type RawDepMap = {[arg: string]: Dependency};

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
            tags: [debugName, 'factory'].concat(tags)
        })
        return driver.set(fn, meta)
    }
}

function getter<T: Object>(cacheRec: CacheRec): T {
    return cacheRec.getValue()
}

function model<T: StateModel>(
    driver: AbstractMetaDriver,
    tags: Array<string>,
    mdl: Dependency<T>
): Dependency<T> {
    const debugName: string = getFunctionName((mdl: Function));
    const meta = new DepMeta({
        tags: [debugName, 'model'].concat(tags)
    })

    const modelMeta = meta.copy({
        fn: getter,
        isState: true,
        deps: [meta.copy({isCacheRec: true})]
    })

    return driver.set(mdl, modelMeta)
}

function proxifyResult<R: Function>(src: R, cacheRec: CacheRec): R {
    return createProxy(src, [cacheRec.setValue])
}

function setter<S: StateModel>(
    driver: AbstractMetaDriver,
    tags: Array<string>,
    dep: Dependency<S>,
    rawDeps: Array<Dependency>
): DepDecoratorFn {
    return function __setter<T>(sourceFn: Dependency<T>): Dependency<T> {
        const depMeta = driver.get(dep)
        const debugName = depMeta.displayName
        const source: DepMeta = new DepMeta({
            ...normalizeDeps(driver, [dep].concat(rawDeps)),
            fn: sourceFn,
            tags: [debugName, 'source'].concat(tags)
        });


        const setterMeta: DepMeta = new DepMeta({
            deps: [source, depMeta.copy({isCacheRec: true})],
            fn: proxifyResult,
            tags: [debugName, 'setter'].concat(tags)
        });

        return driver.set(sourceFn, setterMeta)
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

        this.meta = function __meta(dep: Dependency): Dependency {
            const depMeta = driver.get(dep)
            function getMeta(cacheRec: CacheRec): EntityMeta {
                return cacheRec.meta
            }
            getMeta.displayName = 'getMeta@' + depMeta.displayName
            driver.set(getMeta, depMeta.copy({isCacheRec: true}))

            return getMeta
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
