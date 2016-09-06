// @flow

import type {LifeCycle} from 'reactive-di/interfaces/deps'

export default class Collector<T> {
    _parents: Set<T>[] = []

    begin(): void {
        this._parents.push(new Set())
    }

    _items: T[]
    _updateItems: (item: T) => void = (item: T) => {
        this._items.push(item)
    }

    end(items: T[], t: ?T): void {
        const deps = this._parents
        if (t) {
            for (let i = 0, l = deps.length; i < l; i++) {
                deps[i].add(t)
            }
        }
        this._items = items
        deps.pop().forEach(this._updateItems)
    }

    addCached(items: T[]): void {
        if (!items.length) {
            return
        }

        const k: number = items.length
        const deps = this._parents
        for (let i = 0, l = deps.length; i < l; i++) {
            const dep = deps[i]
            for (let j = 0; j < k; j++) {
                dep.add(items[j])
            }
        }
    }
}
