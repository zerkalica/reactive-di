/* @flow */
import type {
    Provider
} from 'reactive-di/i/nodeInterfaces'

export default class HotRelationUpdater {
    _parents: Array<Map<Provider, boolean>>;

    constructor() {
        this._parents = []
    }

    begin(provider: Provider): void {
        const {_parents: parents} = this
        for (let i = 0, l = parents.length; i < l; i++) {
            parents[i].set(provider, true)
        }
        parents.push(new Map())
    }

    end(provider: Provider): void {
        const childMap = this._parents.pop()
        function iterateMap(val: boolean, childProvider: Provider): void {
            provider.addChild(childProvider)
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
                childMap.set(childs[j], true)
            }
        }
    }
}
