/* @flow */

import DepMeta from './meta/DepMeta'
import type {FromJS, DepId, IdsMap, NotifyDepFn} from './interfaces'
import EntityMeta from './promised/EntityMeta'

export class AbstractDataCursor<V> {
    get(): V|any {
    }
    fromJS: FromJS;
    /* eslint-disable no-unused-vars */
    set(newModel: V): boolean {
        return true
    }
    /* eslint-enable no-unused-vars */
}

export class AbstractPromisedCursor {
    /* eslint-disable no-unused-vars */
    get(): EntityMeta {
        return new EntityMeta()
    }
    pending(): void {
    }

    success(): void {
    }
    error(reason: Error): void {
    }
    /* eslint-enable no-unused-vars */
}

export class AbstractCursor<T: Object> {
    /* eslint-disable no-unused-vars */
    get(): T|any {
    }

    set(value: T|Promise<T>): void {

    }

    getMeta(): EntityMeta {
        return new EntityMeta()
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
