/* @flow */

import DepMeta from './meta/DepMeta'
import type {FromJS, DepId, IdsMap, NotifyDepFn} from './interfaces'

export class AbstractCursor<V> {
    get(): V|any {
    }
    /* eslint-disable no-unused-vars */
    set(newModel: V): void {
    }
    /* eslint-enable no-unused-vars */
}

export class AbstractSelector {
    /* eslint-disable no-unused-vars */
    getDepMap(): IdsMap {
        return {}
    }

    fromJS: FromJS;

    setNotify(notify: NotifyDepFn): AbstractSelector {
        return this
    }

    select<T: Object>(id: DepId): AbstractCursor<T> {
        return new AbstractCursor()
    }
    /* eslint-enable no-unused-vars */
}

function fn() {
    throw new Error('Implement AbstractSelector')
}

DepMeta.set(AbstractSelector, new DepMeta({
    fn
}))
