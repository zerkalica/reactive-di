/* eslint-env mocha */
/* @flow */
import merge from '~/utils/merge'
import assert from 'power-assert'

type ARec = {
    a?: ?string;
}

class A {
    a: ?string;

    constructor(rec: ARec = {}) {
        this.a = rec.a || null
    }
}

describe('mergeTest', () => {
    it('should return new object, if prop changed', () => {
        const a = new A({a: 'test1'})
        const b = merge(a, {a: 'test2'})
        assert(b !== a)
        assert(b instanceof A)
    })

    it('should return same object, if prop not changed', () => {
        const a = new A({a: 'test1'})
        const b = merge(a, {a: 'test1'})
        assert(b === a)
    })

    it('should return same object, if empty rec given', () => {
        const a = new A({a: 'test1'})
        const b = merge(a, {})
        assert(b === a)
    })
})
