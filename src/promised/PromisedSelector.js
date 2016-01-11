/* @flow */

import type {DepId, NotifyDepFn} from '../interfaces'
import PromisedCursor from './PromisedCursor'
import {DepNode} from '../selectorInterfaces'

export default class PromisedSelector {
    _cursors: {[id: DepId]: PromisedCursor};
    _depNodeMap: {[id: DepId]: DepNode};
    _notify: NotifyDepFn;

    constructor(
        depNodeMap: {[id: DepId]: DepNode},
        notify: NotifyDepFn
    ) {
        this._cursors = Object.create(null)
        this._notify = notify
        this._depNodeMap = depNodeMap
    }

    select(id: DepId): PromisedCursor {
        const {_cursors} = this
        let cursor = _cursors[id]
        if (!cursor) {
            cursor = this._select(id)
            _cursors[id] = cursor
        }
        return cursor
    }

    _select(id: DepId): PromisedCursor {
        const {_notify, _depNodeMap: depNodeMap} = this
        function notify() {
            _notify(id)
        }

        const {childs, parent} = depNodeMap[id];

        const childCursors: Array<PromisedCursor> = childs.map(childId => this.select(childId));
        const parentCursor: ?PromisedCursor = parent ? this.select(parent) : null;

        return new PromisedCursor(childCursors, parentCursor, notify)
    }
}
