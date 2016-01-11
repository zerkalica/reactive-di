/* eslint-env mocha */
/* @flow */

import assert from 'power-assert'
import PromisedCursor from '../PromisedCursor'
import EntityMeta from '../EntityMeta'
import {spy} from 'sinon'

describe('PromiseCursorTest', () => {
    function createCursor(id: string, metaMap: {[id: string]: EntityMeta}): {
        cursor: PromisedCursor,
        notify: () => void,
        metaMap: {[id: string]: EntityMeta}
    } {
        const parents = {
            c: ['b', 'a'],
            a: [],
            b: ['a']
        }

        const childs = {
            c: [],
            a: ['b'],
            b: ['c']
        }

        const notify = spy()
        return {
            notify,
            metaMap,
            cursor: new PromisedCursor(childs[id], notify)
        }
    }

    it('should get meta by id', () => {
        const map = createMetaMap()
        const r1 = createCursor('c', map)
        const r2 = createCursor('a', map)

        assert(r1.cursor.get() === r1.metaMap.c)
        assert(r2.cursor.get() === r2.metaMap.a)
    })

    it('should set meta to pending', () => {
        const map = createMetaMap()
        const {cursor} = createCursor('c', map)
        const oldCursor = cursor.get()
        assert(oldCursor.pending === false)
        cursor.pending()
        assert(cursor.get() !== oldCursor)
        assert(cursor.get().pending === true)
    })

    it('should affect parent cursors', () => {
        const map = createMetaMap()
        const {cursor: c} = createCursor('c', map)
        const {cursor: a} = createCursor('a', map)
        const {cursor: b} = createCursor('b', map)

        c.pending()
        // assert(c.get().pending === true)
        assert(a.get().pending === true)
        assert(b.get().pending === true)
        c.success()
        assert(c.get().pending === false)
        assert(c.get().fulfilled === true)
        assert(a.get().pending === false)
        assert(b.get().pending === false)
    })
})
