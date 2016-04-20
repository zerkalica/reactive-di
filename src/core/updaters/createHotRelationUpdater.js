/* @flow */
import type {
    Provider,
    RelationUpdater
} from 'reactive-di/i/coreInterfaces'
import SimpleSet from 'reactive-di/utils/SimpleSet'

class HotRelationUpdater {
    _dependants: Array<Set<Provider>> = [];
    length: number = 0;

    begin(dependency: Provider): void {
        const {_dependants: deps} = this
        const l = this.length
        for (let i = 0; i < l; i++) {
            deps[i].add(dependency)
        }
        deps[l] = new SimpleSet()
        this.length = l + 1
    }

    end(dependant: Provider): void {
        const l = this.length - 1
        this.length = l
        const dependantSet = this._dependants[l]
        const deps = dependant.dependencies
        function iterateMap(dependency: Provider): void {
            deps.push(dependency)
            dependant.addDependency(dependency)
        }

        dependantSet.forEach(iterateMap)
    }

    addCached(dependency: Provider): void {
        const {_dependants: dependants} = this
        const deps: Array<Provider> = dependency.dependencies;
        const k: number = deps.length;
        const l = this.length
        for (let i = 0; i < l; i++) {
            const dependantSet: Set<Provider> = dependants[i];
            for (let j = 0; j < k; j++) {
                dependantSet.add(deps[j])
            }
        }
    }
}

export default function createHotRelationUpdater(): RelationUpdater {
    return new HotRelationUpdater()
}
