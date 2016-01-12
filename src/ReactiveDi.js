/* @flow */

import createProxy from './utils/createProxy'
import AbstractMetaDriver from './meta/drivers/AbstractMetaDriver'
import DepMeta from './meta/DepMeta'
import MetaLoader from './meta/MetaLoader'
import {AbstractSelector} from './selectorInterfaces'
import type {Dependency, DepId, IdsMap} from './interfaces'
import EntityMeta, {updateMeta} from './promised/EntityMeta'
import CacheRec from './CacheRec'
import IdsMapUpdater from './meta/IdsMapUpdater'

type MiddlewareMap = {[id: DepId]: Array<DepMeta>};

function normalizeMiddlewares(
    rawMiddlewares: Array<[Dependency, Array<Dependency>]>,
    getDepMeta: (dep: Dependency) => DepMeta
): MiddlewareMap {
    const middlewares: MiddlewareMap = {};
    for (let i = 0, l = rawMiddlewares.length; i < l; i++) {
        const [frm, toDeps] = rawMiddlewares[i]
        const key = getDepMeta(frm).id
        let group = middlewares[key]
        if (!group) {
            group = []
            middlewares[key] = group
        }
        for (let j = 0, k = toDeps.length; j < k; j++) {
            group.push(getDepMeta(toDeps[j]))
        }
    }

    return middlewares
}

export default class ReactiveDi {
    _metaLoader: MetaLoader;
    _listeners: Array<Dependency>;
    _middlewares: MiddlewareMap;
    _idsMapUpdater: IdsMapUpdater;

    constructor(
        driver: AbstractMetaDriver,
        selector: AbstractSelector,
        aliases?: Array<[Dependency, Dependency]>,
        middlewares?: Array<[Dependency, Array<Dependency>]>
    ) {
        this._listeners = []
        this._idsMapUpdater = new IdsMapUpdater(selector)
        this._metaLoader = new MetaLoader(driver, aliases)

        this._middlewares = normalizeMiddlewares(
            middlewares || [],
            dep => this._metaLoader.get(dep)
        )
    }

    mount<T>(dep: Dependency<T>): void {
        const {_idsMapUpdater, _metaLoader, _listeners} = this
        const {id, deps} = _metaLoader.get(dep)
        // do not call listener on first state change
        _idsMapUpdater.reset(id)
        _listeners.push(dep)
    }

    unmount<T>(dep: Dependency<T>): void {
        const {_idsMapUpdater, _metaLoader, _listeners} = this
        const {id} = _metaLoader.get(dep)
        // do not call listener on first state change
        _idsMapUpdater.reset(id)

        function _listenersFilter(d) {
            return dep !== d
        }

        this._listeners = _listeners.filter(_listenersFilter)
    }

    _get(depMeta: DepMeta, debugCtx: Array<string>): CacheRec {
        const {
            id,
            isState,
            displayName,
            deps,
            depNames,
            fn,
            onUpdate
        } = depMeta

        const cacheRec = this._idsMapUpdater.get(id, deps, isState)

        if (cacheRec.reCalculate || isState) {
            const defArgs = depNames ? [{}] : []
            const newMeta: EntityMeta = cacheRec.createMeta();
            let isChanged = false
            for (let i = 0, j = deps.length; i < j; i++) {
                const dep = deps[i]
                const depRec = this._get(
                    dep,
                    debugCtx.concat([displayName, '' + i])
                )
                if (depNames) {
                    defArgs[0][depNames[i]] = dep.fromCacheRec(depRec)
                } else {
                    defArgs.push(dep.fromCacheRec(depRec))
                }
                if (updateMeta(newMeta, depRec.meta)) {
                    isChanged = true
                }
            }
            let result
            try {
                result = fn(...defArgs)
                onUpdate(cacheRec.value, result)
            } catch (e) {
                e.message = e.message + ', @path: '
                    + debugCtx.concat([displayName]).join('.')
                throw e
            }
            cacheRec.reCalculate = false
            cacheRec.value = this._proxify(result, id)
            if (isChanged) {
                cacheRec.meta = newMeta
            }
        }

        return cacheRec
    }

    _proxify<T: Function>(result: T, id: DepId): T {
        const middlewares = this._middlewares[id]
        if (!middlewares) {
            return result
        }
        const resolvedMdls = []
        const debugCtx = []
        for (let i = 0, j = middlewares.length; i < j; i++) {
            resolvedMdls.push(this._get(middlewares[i], debugCtx))
        }

        return createProxy(result, resolvedMdls)
    }

    get<T>(dep: Dependency<T>): T {
        return this._get(this._metaLoader.get(dep), []).value
    }
}
