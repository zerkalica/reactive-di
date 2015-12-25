/* @flow */
/* eslint-env mocha */
import assert from 'power-assert'
import Selector from '../Selector'
import Cursor from '../Cursor'
import {spy} from 'sinon'
import {S, getDepId} from './ExampleState'

describe('SelectorTest', () => {
    it('select should return dep map', () => {
        const s = new S()
        const selector = new Selector(s, getDepId)
        const depMap = selector.getDepMap()
        assert.deepEqual(depMap, {
            s: ['s', 'a', 'b', 'c'],
            a: ['s', 'a'],
            b: ['s', 'b', 'c'],
            c: ['s', 'b', 'c']
        })
    })

    it('select should return cursor', () => {
        const s = new S()
        const selector = new Selector(s, getDepId)
        selector.getDepMap()
        const cursor = selector.select('s')
        assert(cursor instanceof Cursor)
    })

    it('select should call notify, if cursor.set called', () => {
        const s = new S()
        const notify = spy()
        const selector = new Selector(s, getDepId)
        selector.setNotify(notify)
        const cursor = selector.select('a')
        cursor.data.set(cursor.data.get().copy({
            name: 'testA1'
        }))
        assert(cursor instanceof Cursor)
        assert(notify.calledOnce)
    })
})
