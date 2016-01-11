/* @flow */

import DepMeta from './meta/DepMeta'
import type {FromJS, DepId, NotifyDepFn} from './interfaces'
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

function fn() {
    throw new Error('Implement AbstractSelector')
}

export const selectorMeta: DepMeta = new DepMeta({fn});
export const promisedSelectorMeta: DepMeta = new DepMeta({fn});

export class DepNode {
    // Nearest parent
    parent: ?DepId;

    // Nearest childs
    childs: Array<DepId>;

    // All parents and childs
    relations: Array<DepId>;

    constructor(parentId: ?DepId, relations?: Array<DepId>) {
        this.parent = parentId
        this.childs = []
        this.relations = relations || []
    }
}

export class StateNode {
    path: Array<string>;
    fromJS: FromJS;

    constructor(path: Array<string>, fromJS: FromJS) {
        this.path = path
        this.fromJS = fromJS
    }
}

export class AbstractSelector {
    depNodeMap: {[id: DepId]: DepNode};

    /* eslint-disable no-unused-vars */
    setNotify(notify: NotifyDepFn): AbstractSelector {
        return this
    }

    select<T: Object>(id: DepId): AbstractDataCursor<T> {
        return new AbstractDataCursor()
    }
    /* eslint-enable no-unused-vars */
}
