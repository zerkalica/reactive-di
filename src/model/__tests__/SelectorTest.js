/* @flow */
/* eslint-env mocha */
import assert from 'power-assert'
import Selector from '../Selector'
import {AbstractDataCursor} from '../../interfaces'
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
        assert(cursor instanceof AbstractDataCursor)
    })

    it('select should call notify, if cursor.set called', () => {
        const s = new S()
        const notify = spy()
        const selector = new Selector(s, getDepId)
        selector.setNotify(notify)
        const cursor = selector.select('a')
        cursor.set(cursor.get().copy({
            name: 'testA1'
        }))
        assert(cursor instanceof AbstractDataCursor)
        assert(notify.calledOnce)
    })

    it('select should not call notify, if cursor.set same data', () => {
        const s = new S()
        const notify = spy()
        const selector = new Selector(s, getDepId)
        selector.setNotify(notify)
        const cursor = selector.select('a')
        const newData = cursor.get().copy({
            name: 'testA1'
        })
        cursor.set(newData)
        cursor.set(newData)
        assert(notify.calledOnce)
    })
})
