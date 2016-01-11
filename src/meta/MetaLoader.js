/* @flow */

import AbstractMetaDriver from './drivers/AbstractMetaDriver'
import DepMeta from './DepMeta'
import IdsMapUpdater from './IdsMapUpdater'
import PromisedSelector from '../promised/PromisedSelector'
import type {Dependency, NotifyDepsFn, DepId} from '../interfaces'
import {AbstractSelector} from '../selectorInterfaces'

export default class MetaLoader {
    _cachedMeta: {[id: DepId]: DepMeta};
    _notify: NotifyDepsFn;
    _driver: AbstractMetaDriver;
    _idsMapUpdater: IdsMapUpdater;

    selector: AbstractSelector;
    promiseSelector: PromisedSelector;

    constructor(
        driver: AbstractMetaDriver,
        selector: AbstractSelector,
        notify: NotifyDepsFn,
        aliases?: Array<[Dependency, Dependency]>
    ) {
        const depNodeMap = selector.depNodeMap
        this._idsMapUpdater = new IdsMapUpdater(depNodeMap)
        const stateIdToIdsMap = this._idsMapUpdater.stateIdToIdsMap
        function notifyIdChange(id: DepId): void {
            notify(stateIdToIdsMap[id] || [])
        }
        this.promiseSelector = new PromisedSelector(depNodeMap, notifyIdChange)

        this._cachedMeta = Object.create(null)
        this._driver = driver

        this.selector = selector
        this.selector.setNotify(notifyIdChange)

        ;(aliases || []).forEach(([depSrc, depTarget]) => {
            this._cachedMeta[driver.get(depSrc).id] = driver.get(depTarget)
        })
    }

    get(dep: Dependency): DepMeta {
        const depMeta = this._driver.get(dep)
        return this._cachedMeta[depMeta.id] || depMeta
    }

    update(id: DepId, deps: Array<DepMeta>): void {
        this._idsMapUpdater.update(id, deps)
    }
}
