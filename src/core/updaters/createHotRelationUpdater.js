/* @flow */
import type {
    Provider,
    RelationUpdater
} from 'reactive-di/i/coreInterfaces'
import SimpleSet from 'reactive-di/utils/SimpleSet'

class HotRelationUpdater {
    _dependants: Array<Set<Provider>>;

    constructor() {
        this._dependants = []
    }

    begin(dependency: Provider): void {
        const {_dependants: dependants} = this
        for (let i = 0, l = dependants.length; i < l; i++) {
            dependants[i].add(dependency)
        }
        dependants.push(new SimpleSet())
    }

    end(dependency: Provider): void {
        const dependantSet = this._dependants.pop()
        function iterateMap(dependant: Provider): void {
            dependant.addDependency(dependency)
        }
        dependantSet.forEach(iterateMap)
    }

    inheritRelations(dependency: Provider): void {
        const l: number = this._dependants.length;
        if (!l) {
            return
        }
        const dependants: Array<Set<Provider>> = this._dependants;
        const inheritDependants: Array<Provider> = dependency.getDependants();
        const k: number = inheritDependants.length;
        for (let i = 0; i < l; i++) {
            const dependantSet: Set<Provider> = dependants[i];
            for (let j = 0; j < k; j++) {
                const dependant: Provider = inheritDependants[j];
                dependantSet.add(dependant)
            }
        }
    }
}

export default function createHotRelationUpdater(): RelationUpdater {
    return new HotRelationUpdater()
}
