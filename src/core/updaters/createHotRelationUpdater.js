/* @flow */
import type {
    Provider,
    RelationUpdater
} from 'reactive-di/i/coreInterfaces'
import SimpleMap from 'reactive-di/utils/SimpleMap'

class HotRelationUpdater {
    _parents: Array<Map<Provider, Provider>>;

    constructor() {
        this._parents = []
    }

    begin(provider: Provider): void {
        const {_parents: parents} = this
        for (let i = 0, l = parents.length; i < l; i++) {
            parents[i].set(provider, provider)
        }
        parents.push(new SimpleMap())
    }

    end(provider: Provider): void {
        const childMap = this._parents.pop()
        function iterateMap(childProvider: Provider): void {
            childProvider.addParent(provider)
        }
        childMap.forEach(iterateMap)
    }

    inheritRelations(provider: Provider): void {
        const l = this._parents.length
        if (!l) {
            return
        }
        const parents = this._parents
        const childs = provider.getChilds()
        const k = childs.length
        for (let i = 0; i < l; i++) {
            const childMap = parents[i];
            for (let j = 0; j < k; j++) {
                const child = childs[k]
                childMap.set(child, child)
            }
        }
    }
}

export default function createHotRelationUpdater(): RelationUpdater {
    return new HotRelationUpdater()
}
