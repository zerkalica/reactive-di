/* @flow */
/* eslint-env mocha */

import assert from 'power-assert'

import createDepMetaFromState from '../createDepMetaFromState'
import {S, B, getDepId} from './ExampleState'

describe('createDepMetaFromStateTest', () => {
    it('should build deps for {a, {b: c}}', () => {
        const s = new S()
        const {depMap} = createDepMetaFromState(s, getDepId)
        assert.deepEqual(depMap, {
            s: ['s', 'a', 'b', 'c'],
            a: ['s', 'a'],
            b: ['s', 'b', 'c'],
            c: ['s', 'b', 'c']
        })
    })

    it('should build valid pathmap for {a, {b: c}}', () => {
        const s = new S()
        const {pathMap} = createDepMetaFromState(s, getDepId)
        assert.deepEqual(pathMap, {
            s: [],
            a: ['a'],
            b: ['b'],
            c: ['b', 'c']
        })
    })

    it('should build valid fromJSMap for {a, {b: c}}', () => {
        const s = new S()
        const {fromJSMap} = createDepMetaFromState(s, getDepId)
        const s2 = fromJSMap.s({
            b: {
                c: {
                    name: 'testC-changed'
                }
            }
        })
        assert(s !== s2)
        assert(s2 instanceof S)
        assert(s2.b.c.name === 'testC-changed')
    })

    it('should build valid fromJSMap for {b: c}', () => {
        const s = new S()
        const {fromJSMap} = createDepMetaFromState(s, getDepId)
        const b2 = fromJSMap.b({
            c: {
                name: 'testC-changed'
            }
        })
        assert(s.b !== b2)
        assert(b2 instanceof B)
        assert(b2.c.name === 'testC-changed')
    })
})
