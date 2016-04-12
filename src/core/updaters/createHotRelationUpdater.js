/* @flow */
import type {
    Provider,
    RelationUpdater
} from 'reactive-di/i/coreInterfaces'
import SimpleSet from 'reactive-di/utils/SimpleSet'

class HotRelationUpdater {
    _parents: Array<Set<Provider>>;

    constructor() {
        this._parents = []
    }

    begin(provider: Provider): void {
        const {_parents: parents} = this
        for (let i = 0, l = parents.length; i < l; i++) {
            parents[i].add(provider)
        }
        parents.push(new SimpleSet())
    }

    end(child: Provider): void {
        const parentMap = this._parents.pop()
        function iterateMap(parent: Provider): void {
            parent.addChild(child)
        }
        parentMap.forEach(iterateMap)
    }

    inheritRelations(provider: Provider): void {
        const l: number = this._parents.length;
        if (!l) {
            return
        }
        const parents: Array<Set<Provider>> = this._parents;
        const childs: Array<Provider> = provider.getParents();
        const k: number = childs.length;
        for (let i = 0; i < l; i++) {
            const childMap: Set<Provider> = parents[i];
            for (let j = 0; j < k; j++) {
                const child: Provider = childs[j];
                childMap.add(child)
            }
        }
    }
}

export default function createHotRelationUpdater(): RelationUpdater {
    return new HotRelationUpdater()
}
