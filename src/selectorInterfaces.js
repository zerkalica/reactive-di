/* @flow */

import DepMeta from './meta/DepMeta'
import type {DepId, IdsMap, NotifyDepFn, Dependency} from './interfaces'

export class AbstractCursor<V> {
    get(): V|any {
    }

    set(newModel: V): void {
    }
}

export class AbstractSelector {
    getDepMap(notify: NotifyDepFn): IdsMap {
        return {}
    }

    select<T: Object>(id: DepId): AbstractCursor<T> {
        return new AbstractCursor()
    }
}

function fn() {
    throw new Error('Implement AbstractSelector')
}

DepMeta.set(AbstractSelector, new DepMeta({
    fn
}))
