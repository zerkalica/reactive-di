// @flow

const isRealMap: boolean = typeof (Map: any) !== 'undefined' && !!(Map.toString().match('native code'))

if (!isRealMap) {
    class Map<K, Item> { //eslint-disable-line
        _map: {[id: K]: Item} = Object.create(null)

        set(k: K, v: Item): void {
            this._map[k] = v
        }

        get(k: K): ?Item {
            return this._map[k]
        }

        delete(k: K): void {
            delete this._map[k]
        }
    }
}

export default class IdIndexer<Id, Item: {id: Id}> {
    _map: Map<Id, Item> = new Map()

    add(item: Item): void {
        this._map.set(item.id, item)
    }

    removeAll(): void {
        this._map = new Map()
    }

    remove(item: Item): void {
        this._map.delete(item.id)
    }

    update(newItem: Item, oldItem: ?Item): void {
        this._map.set(newItem.id, newItem)
        if (oldItem && newItem.id !== oldItem.id) {
            this._map.delete(oldItem.id)
        }
    }

    pick(ids: Id[]): Item[] {
        const map = this._map
        const result: Item[] = []
        for (let i = 0, l = ids.length; i < l; i++) {
            const item = map.get(ids[i])
            if (!item) {
                throw new Error(`Item not found in index: ${String(ids[i])}`)
            }
            result.push(item)
        }

        return result
    }
}
