/* @flow */

import DepMeta from './DepMeta'
import type {DepId, IdsMap} from '../interfaces'

class PathMapUpdater {
    _pathsSets: {[id: DepId]: Set<DepId>};
    _pathsSetsValues: Array<DepId>;

    _stateIdToIdsMap: IdsMap;
    _idToStateIdsMap: IdsMap;

    constructor(
        stateIdToIdsMap: IdsMap,
        idToStateIdsMap: IdsMap
    ) {
        this._stateIdToIdsMap = stateIdToIdsMap
        this._idToStateIdsMap = idToStateIdsMap
        this._pathsSets = Object.create(null)
        this._pathsSetsValues = []
    }

    isAffected(id: DepId): boolean {
        const pth: ?Array<DepId> = this._idToStateIdsMap[id];
        if (pth) {
            for (let i = 0; i < pth.length; i++) {
                this.addPath(pth[i])
            }
            return true
        }

        return false
    }

    begin(id: DepId): void {
        this._pathsSets[id] = new Set()
        this._pathsSetsValues.push(id)
    }

    addPath(stateId: DepId): void {
        const pathsSets = this._pathsSets
        const pathsSetsValues = this._pathsSetsValues
        for (let i = 0, j = pathsSetsValues.length; i < j; i++) {
            pathsSets[pathsSetsValues[i]].add(stateId)
        }
    }

    end(id: DepId): void {
        const stateIdToIdsMap = this._stateIdToIdsMap
        const paths: Array<DepId> = [];

        this._pathsSets[id].forEach(function iterate(stateId) {
            let facets: Array<DepId> = stateIdToIdsMap[stateId];
            if (!facets) {
                facets = []
                stateIdToIdsMap[stateId] = facets
            }
            facets.push(id)
            paths.push(stateId)
        })

        this._idToStateIdsMap[id] = paths
        this._pathsSetsValues.pop()
    }
}

function dependencyScanner(
    id: DepId,
    parentDeps: Array<DepMeta>,
    acc: PathMapUpdater
): void {
    if (!acc.isAffected(id)) {
        acc.begin(id)
        for (let i = 0, j = parentDeps.length; i < j; i++) {
            const dep = parentDeps[i];
            dependencyScanner(dep.id, dep.deps, acc)
        }
        acc.end(id)
    }
}

export default function updateIdsMap(
    id: DepId,
    deps: Array<DepMeta>,
    stateIdToIdsMap: IdsMap,
    idToStateIdsMap: IdsMap
): void {
    dependencyScanner(id, deps, new PathMapUpdater(stateIdToIdsMap, idToStateIdsMap))
}
