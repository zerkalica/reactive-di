/* @flow */

import DepMeta from './meta/DepMeta'
import type {FromJS, DepId, IdsMap, NotifyDepFn} from './interfaces'

export class AbstractCursor<V> {
    get(): V|any {
    }
    fromJS: FromJS;
    /* eslint-disable no-unused-vars */
    set(newModel: V): void {
    }
    /* eslint-enable no-unused-vars */
}

function fn() {
    throw new Error('Implement AbstractSelector')
}

export const selectorMeta: DepMeta = new DepMeta({fn});

export class AbstractSelector {

    /* eslint-disable no-unused-vars */
    getDepMap(): IdsMap {
        return {}
    }

    setNotify(notify: NotifyDepFn): AbstractSelector {
        return this
    }

    select<T: Object>(id: DepId): AbstractCursor<T> {
        return new AbstractCursor()
    }
    /* eslint-enable no-unused-vars */
}
