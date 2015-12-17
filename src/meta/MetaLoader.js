/* @flow */

import updateIdsMap from './updateIdsMap'
import DepMeta from './DepMeta'
import Selector from '../model/Selector'
import type {Dependency, NotifyDepsFn, IdsMap, DepId} from '../interfaces'

export default class MetaLoader {
    _cache: {[id: DepId]: DepMeta};
    _stateIdToIdsMap: IdsMap;
    _idToStateIdsMap: IdsMap;
    _notify: NotifyDepsFn;

    constructor(
        selector: Selector,
        notify: NotifyDepsFn,
        registeredDeps?: Array<[Dependency, Dependency]>
    ) {
        this._cache = Object.create(null)
        this._stateIdToIdsMap = Object.create(null);

        const depMap = selector.getDepMap(id => notify(this._stateIdToIdsMap[id] || []));
        this._idToStateIdsMap = depMap;

        (registeredDeps || []).forEach(([depSrc, depTarget]) => {
            this._cache[DepMeta.get(depSrc).id] =  DepMeta.get(depTarget)
        })
    }

    get(dep: Dependency): DepMeta {
        const depMeta = DepMeta.get(dep)
        return this._cache[depMeta.id] || depMeta
    }

    update(id: DepId, deps: Array<DepMeta>): void {
        if (!this._idToStateIdsMap[id]) {
            updateIdsMap(id, deps, this._stateIdToIdsMap, this._idToStateIdsMap)
        }
    }
}
