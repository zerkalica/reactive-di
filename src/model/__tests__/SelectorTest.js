/* @flow */
/* eslint-env mocha */
import assert from 'power-assert'
import Selector from '../Selector'
import Cursor from '../Cursor'
import {spy} from 'sinon'
import {S, getDepId} from './ExampleState'

describe('SelectorTest', () => {
    it('should throws error if getDepMap not called first', () => {
        const s = new S()
        const selector = new Selector(s, getDepId)
        assert.throws(() => {
            selector.select('c')
        }, 'Call selector.getDepMap first')
    })

    it('select should return dep map', () => {
        const s = new S()
        const notify = spy()
        const selector = new Selector(s, getDepId)
        const depMap = selector.getDepMap(notify)
        assert.deepEqual(depMap, {
            s: ['s', 'a', 'b', 'c'],
            a: ['s', 'a'],
            b: ['s', 'b', 'c'],
            c: ['s', 'b', 'c']
        })
    })

    it('select should return cursor', () => {
        const s = new S()
        const notify = spy()
        const selector = new Selector(s, getDepId)
        selector.getDepMap(notify)
        const cursor = selector.select('s')
        assert(cursor instanceof Cursor)
    })

    it('select should update state, if cursor.set called', () => {
        const s = new S()
        const notify = spy()
        const selector = new Selector(s, getDepId)
        selector._setState = spy(state => {
            assert(state instanceof S)
            assert(state !== s)
        })
        selector.getDepMap(notify)
        const cursor = selector.select('a')
        cursor.set(cursor.get().copy({
            name: 'testA1'
        }))
        assert(cursor instanceof Cursor)
        assert(selector._setState.calledOnce)
    })
})
