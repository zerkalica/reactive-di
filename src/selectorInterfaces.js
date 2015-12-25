/* @flow */

import DepMeta from './meta/DepMeta'
import type {FromJS, DepId, IdsMap, NotifyDepFn} from './interfaces'
import EntityMeta from './promised/EntityMeta'

export class AbstractCursor<V> {
    get(): V|any {
    }
    fromJS: FromJS;
    /* eslint-disable no-unused-vars */
    set(newModel: V): void {
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

export class Cursors<T> {
    data: AbstractCursor<T>;
    promised: AbstractPromisedCursor;

    constructor(data: AbstractCursor, promised: AbstractPromisedCursor) {
        this.data = data
        this.promised = promised
    }
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

    select<T: Object>(id: DepId): Cursors<T> {
        return new Cursors(new AbstractCursor(), new AbstractPromisedCursor())
    }
    /* eslint-enable no-unused-vars */
}
