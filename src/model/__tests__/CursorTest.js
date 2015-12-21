/* @flow */
/* eslint-env mocha */
import assert from 'power-assert'
import Cursor from '../Cursor'
import {spy} from 'sinon'
import {pathMap, S, A} from './ExampleState'

describe('CursorTest', () => {
    it('should get state part s.a', () => {
        const s = new S()
        const setState = spy()
        const fromJS = spy()
        const cursor = new Cursor(pathMap.a, fromJS, s, setState)
        const modelA: A = cursor.get();

        assert(modelA === s.a)
    })

    it('should set state part s.a', () => {
        const s = new S()
        const setState = spy()
        const fromJS = spy()
        const cursor = new Cursor(pathMap.a, fromJS, s, setState)
        const modelA: A = cursor.get();
        cursor.set(modelA.copy({
            name: 'testA1'
        }))
        const modelA1: A = cursor.get();

        assert(modelA !== modelA1)
        assert(modelA.name === 'testA')
        assert(modelA1.name === 'testA1')
    })

    it('should set state part s.b.c', () => {
        const s = new S()
        const setState = state => {
            assert(state.b.c.name === 'testB1')
        }
        const fromJS = spy()
        const cursor = new Cursor(pathMap.c, fromJS, s, setState)
        const modelB: A = cursor.get();
        cursor.set(modelB.copy({
            name: 'testB1'
        }))
        const modelB1: A = cursor.get();

        assert(modelB !== modelB1)
        assert(modelB.name === null)
        assert(modelB1.name === 'testB1')
    })

    it('should call setState', () => {
        const s = new S()
        const setState = spy()
        const fromJS = spy()
        const cursor = new Cursor(pathMap.a, fromJS, s, setState)
        const modelA: A = cursor.get();
        cursor.set(modelA.copy({
            name: 'testA1'
        }))

        assert(setState.calledOnce)
    })
})
