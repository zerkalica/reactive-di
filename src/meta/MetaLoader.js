/* @flow */

import updateIdsMap from './updateIdsMap'
import DepMeta from './DepMeta'
import AbstractMetaDriver from './drivers/AbstractMetaDriver'
import {AbstractSelector} from '../selectorInterfaces'
import type {Dependency, NotifyDepsFn, IdsMap, DepId} from '../interfaces'

export default class MetaLoader {
    _cache: {[id: DepId]: DepMeta};
    _stateIdToIdsMap: IdsMap;
    _idToStateIdsMap: IdsMap;
    _notify: NotifyDepsFn;
    _driver: AbstractMetaDriver;

    constructor(
        driver: AbstractMetaDriver,
        selector: AbstractSelector,
        notify: NotifyDepsFn,
        aliases?: Array<[Dependency, Dependency]>
    ) {
        this._cache = Object.create(null)
        this._stateIdToIdsMap = Object.create(null);
        this._driver = driver

        selector.setNotify(id => notify(this._stateIdToIdsMap[id] || []))

        const depMap = selector.getDepMap();
        this._idToStateIdsMap = depMap;

        (aliases || []).forEach(([depSrc, depTarget]) => {
            this._cache[driver.get(depSrc).id] = driver.get(depTarget)
        })
    }

    get(dep: Dependency): DepMeta {
        const depMeta = this._driver.get(dep)
        return this._cache[depMeta.id] || depMeta
    }

    update(id: DepId, deps: Array<DepMeta>): void {
        if (!this._idToStateIdsMap[id]) {
            updateIdsMap(id, deps, this._stateIdToIdsMap, this._idToStateIdsMap)
        }
    }
}
