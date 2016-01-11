/* @flow */
/* eslint-env mocha */

import assert from 'power-assert'

import createDepMetaFromState from '../createDepMetaFromState'
import {S, B, getDepId} from './ExampleState'

const testData = {
    's': {
        'parent': null,
        'childs': [
            'a',
            'b'
        ],
        'relations': [
            's',
            'a',
            'b',
            'c'
        ]
    },
    'a': {
        'parent': 's',
        'childs': [],
        'relations': [
            's',
            'a'
        ]
    },
    'b': {
        'parent': 's',
        'childs': [
            'c'
        ],
        'relations': [
            's',
            'b',
            'c'
        ]
    },
    'c': {
        'parent': 'b',
        'childs': [],
        'relations': [
            's',
            'b',
            'c'
        ]
    }
}

describe('createDepMetaFromStateTest', () => {
    it('should build deps for {a, {b: c}}', () => {
        const s = new S()
        const {depNodeMap} = createDepMetaFromState(s, getDepId)
        assert.deepEqual(depNodeMap.s.relations, ['s', 'a', 'b', 'c'])
        assert.deepEqual(depNodeMap.a.relations, ['s', 'a'])
        assert.deepEqual(depNodeMap.b.relations, ['s', 'b', 'c'])
        assert.deepEqual(depNodeMap.c.relations, ['s', 'b', 'c'])
    })

    it('should build valid pathmap for {a, {b: c}}', () => {
        const s = new S()
        const {stateNodeMap} = createDepMetaFromState(s, getDepId)

        assert.deepEqual(stateNodeMap.s.path, [])
        assert.deepEqual(stateNodeMap.a.path, ['a'])
        assert.deepEqual(stateNodeMap.b.path, ['b'])
        assert.deepEqual(stateNodeMap.c.path, ['b', 'c'])
    })

    it('should build valid fromJSMap for {a, {b: c}}', () => {
        const s = new S()
        const {stateNodeMap} = createDepMetaFromState(s, getDepId)
        const s2 = stateNodeMap.s.fromJS({
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
        const {stateNodeMap} = createDepMetaFromState(s, getDepId)
        const b2 = stateNodeMap.b.fromJS({
            c: {
                name: 'testC-changed'
            }
        })
        assert(s.b !== b2)
        assert(b2 instanceof B)
        assert(b2.c.name === 'testC-changed')
    })

    it('should build valid childs for state', () => {
        const s = new S()
        const {depNodeMap} = createDepMetaFromState(s, getDepId)
        assert.deepEqual(depNodeMap.s.childs, ['a', 'b'])
        assert.deepEqual(depNodeMap.a.childs, [])
        assert.deepEqual(depNodeMap.b.childs, ['c'])
        assert.deepEqual(depNodeMap.c.childs, [])
    })

    it('should build valid parents for state', () => {
        const s = new S()
        const {depNodeMap} = createDepMetaFromState(s, getDepId)
        assert.equal(depNodeMap.s.parent, null)
        assert.equal(depNodeMap.a.parent, ['s'])
        assert.equal(depNodeMap.b.parent, ['s'])
        assert.equal(depNodeMap.c.parent, ['b'])
    })
})
