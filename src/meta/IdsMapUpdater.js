/* @flow */

import DepMeta from './DepMeta'
import type {DepId, IdsMap} from '../interfaces'
import {DepNode} from '../selectorInterfaces'

class PathMapUpdater {
    _pathsSets: {[id: DepId]: Set<DepId>};
    _depPath: Array<DepId>;

    _stateIdToIdsMap: IdsMap;
    _depNodeMap: {[id: DepId]: DepNode};

    constructor(
        stateIdToIdsMap: IdsMap,
        depNodeMap: {[id: DepId]: DepNode}
    ) {
        this._stateIdToIdsMap = stateIdToIdsMap
        this._depNodeMap = depNodeMap
        this._pathsSets = Object.create(null)
        this._depPath = []
    }

    isAffected(id: DepId): boolean {
        const node = this._depNodeMap[id]
        if (node) {
            const {relations} = node
            for (let i = 0, l = relations.length; i < l; i++) {
                this.addPath(relations[i])
            }
            return true
        }

        return false
    }

    begin(id: DepId): void {
        const {_pathsSets: pathsSets, _depPath: depPath, _depNodeMap: depNodeMap} = this
        const len = depPath.length - 1
        const parentId = len >= 0 ? depPath[len] : null
        const node = new DepNode(parentId, [])
        depNodeMap[id] = node
        pathsSets[id] = new Set()
        if (parentId) {
            // add nearest child to parent
            depNodeMap[parentId].childs.push(id)
        }
        depPath.push(id)
    }

    addPath(stateId: DepId): void {
        const {_pathsSets: pathsSets, _depPath: depPath} = this
        for (let i = 0, j = depPath.length; i < j; i++) {
            pathsSets[depPath[i]].add(stateId)
        }
    }

    end(id: DepId): void {
        const {_depPath: depPath, _stateIdToIdsMap: stateIdToIdsMap, _pathsSets: pathsSets} = this
        const {relations} = this._depNodeMap[id]
        pathsSets[id].forEach(function iterate(stateId) {
            let facets: Array<DepId> = stateIdToIdsMap[stateId];
            if (!facets) {
                facets = []
                stateIdToIdsMap[stateId] = facets
            }
            facets.push(id)
            relations.push(stateId)
        })

        depPath.pop()
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

export default class IdsMapUpdater {
    stateIdToIdsMap: IdsMap;
    _depNodeMap: {[id: DepId]: DepNode};

    constructor(depNodeMap: {[id: DepId]: DepNode}) {
        this.stateIdToIdsMap = Object.create(null)
        this._depNodeMap = depNodeMap
    }

    update(id: DepId, deps: Array<DepMeta>): void {
        if (!this._depNodeMap[id]) {
            dependencyScanner(id, deps, new PathMapUpdater(this.stateIdToIdsMap, this._depNodeMap))
        }
    }
}
