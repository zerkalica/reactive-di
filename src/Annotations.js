/* @flow */

import createProxy from './utils/createProxy'
import getFunctionName from './utils/getFunctionName'
import AbstractMetaDriver from './meta/drivers/AbstractMetaDriver'
import CacheRec from './cache/CacheRec'
import EntityMeta from './cache/EntityMeta'
import DepMeta, {Hooks} from './meta/DepMeta'
import type {Dependency, DepId} from './interfaces'
/* eslint-disable no-unused-vars */
import type {StateModel} from './model/interfaces'
/* eslint-enable no-unused-vars */

type DepDecoratorFn<T> = (target: Dependency<T>) => T;
type RawDeps = Array<Dependency> | {[prop: string]: Dependency};

type IDepType = 'model' | 'meta' | 'setter' | 'class' | 'factory';

type RawDepMetaRec = {
    kind: IDepType;
    deps?: RawDeps;
    hooks?: Hooks;
    setters: ?Array<Dependency>;
    tags?: Array<string>;
}

class RawDepMeta {
    kind: IDepType;
    id: ?DepId;
    deps: RawDeps;
    tags: Array<string>;

    // only if kind === 'setter'
    setters: ?Array<Dependency>;

    // only if kind === 'class', 'factory'
    hooks: Hooks;

    constructor(rec: RawDepMetaRec) {
        this.id = null
        this.kind = rec.kind
        this.tags = rec.tags || []
        this.deps = rec.deps || []
        this.hooks = rec.hooks || new Hooks()
        this.setters = rec.setters || null
    }
}

class NormalizedDeps {
    hooks: Hooks;
    deps: Array<DepMeta>;
    depNames: ?Array<string>;

    constructor(driver: AbstractMetaDriver, rDeps: Array<Object>) {
        const deps: Array<DepMeta> = [];
        let depNames: ?Array<string> = null;

        let hooks: Hooks;
        const rawHooks: ?Hooks = rDeps[0];

        if (rawHooks instanceof Hooks) {
            hooks = rawHooks
            /* eslint-disable no-param-reassign */
            rDeps = rDeps.slice(0, 1)
            /* eslint-enable no-param-reassign */
        } else {
            hooks = new Hooks()
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

        this.hooks = hooks
        this.deps = deps
        this.depNames = depNames
    }
}

function getter<T: Object>(cacheRec: CacheRec): T {
    return cacheRec.getValue()
}

function proxifyResult<R: Function>(src: R, cacheRec: CacheRec): R {
    return createProxy(src, [cacheRec.setValue])
}

type SetterFn<S> = (dep: Dependency<S>, ...rawDeps: Array<Dependency>) => DepDecoratorFn<S>;
type ModelFn<T> = (mdl: Dependency<T>) => DepDecoratorFn<T>;
type FactoryFn<T> = (...rawDeps: Array<Dependency>) => DepDecoratorFn<T>;
type KlassFn<T> = (...rawDeps: Array<Dependency>) => DepDecoratorFn<T>;
type MetaFn<T> = (value: Dependency<T>) => Dependency<T>;

export default class Annotations {
    _driver: AbstractMetaDriver;
    _tags: Array<string>;

    setter: SetterFn;
    model: ModelFn;
    factory: FactoryFn;
    klass: KlassFn;
    meta: MetaFn;

    _createId: () => DepId;

    constructor(driver: AbstractMetaDriver, createId: () => DepId, tags: Array<string> = []) {
        this._driver = driver
        this._createId = createId
        this._tags = tags
        this.setter = this._setter.bind(this)
        this.meta = this._meta.bind(this)
        this.model = this._model.bind(this)
        this.factory = this._factory.bind(this)
        this.klass = this._klass.bind(this)
    }

    _setter<S: StateModel>(dep: Dependency<S>, ...rawDeps: Array<Dependency>): DepDecoratorFn {
        const {_driver: driver, _tags: tags} = this
        const id = this._createId()
        return function __setter<T>(sourceFn: Dependency<T>): Dependency<T> {
            const depMeta = driver.get(dep)
            const debugName = depMeta.displayName
            const rec = {
                id,
                ...normalizeDeps(driver, [dep].concat(rawDeps)),
                fn: sourceFn,
                tags: [debugName, 'source'].concat(tags)
            }

            const source = new DepMeta(rec)
            const cacheMeta = new DepMeta({
                ...rec,
                isCacheRec: true
            })

            const setterMeta: DepMeta = new DepMeta({
                id: this._createId(),
                deps: [source, cacheMeta],
                fn: proxifyResult,
                tags: [debugName, 'setter'].concat(tags)
            });

            return driver.set(sourceFn, setterMeta)
        }
    }

    _klass(...rawDeps: Array<Dependency>): DepDecoratorFn {
        const {_driver: driver, _tags: tags} = this
        const id = this._createId()

        /* eslint-disable no-undef */
        return function klass<T>(proto: Class<T>): Dependency<T> {
        /* eslint-enable no-undef */
            const debugName: string = getFunctionName((proto: Function));
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

    _factory(...rawDeps: Array<Dependency>): DepDecoratorFn {
        const {_driver: driver, _tags: tags} = this
        const id = this._createId()

        return function factory<T: Function>(fn: T): Dependency<T> {
            const debugName: string = getFunctionName(fn);
            const meta = new DepMeta({
                id,
                ...normalizeDeps(driver, rawDeps),
                fn,
                tags: [debugName, 'factory'].concat(tags)
            })
            return driver.set(fn, meta)
        }
    }

    _model<T: StateModel>(mdl: Dependency<T>): Dependency<T> {
        const {_driver: driver, _tags: tags} = this
        const id = this._createId()
        const debugName: string = getFunctionName((mdl: Function));
        const cacheMeta = new DepMeta({
            id,
            tags: [debugName, 'cache'].concat(tags),
            isCacheRec: true
        })

        const modelMeta = new DepMeta({
            id,
            fn: getter,
            deps: [cacheMeta],
            tags: [debugName, 'getter'].concat(tags)
        })

        return driver.set(mdl, modelMeta)
    }

    _meta(dep: Dependency): Dependency {
        const {_driver: driver} = this
        const depMeta = driver.get(dep)
        function getMeta(cacheRec: CacheRec): EntityMeta {
            return cacheRec.meta
        }
        getMeta.displayName = 'getMeta@' + depMeta.displayName
        const cacheMeta = new DepMeta({
            ...depMeta,
            isCacheRec: true
        })

        driver.set(getMeta, cacheMeta)

        return getMeta
    }
}
