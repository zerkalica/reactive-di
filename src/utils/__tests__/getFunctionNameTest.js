/* eslint-env mocha */
/* @flow */
import getFunctionName from 'reactive-di/utils/getFunctionName'
import assert from 'power-assert'

describe('getFunctionName', () => {
    it('should return valid function name', () => {
        function test() {
        }

        assert(getFunctionName(test) === 'test')
    })

    it('should return constructor name for class object', () => {
        class B {}
        const b = new B()
        assert(getFunctionName(b) === 'B')
    })

    it('should return empty name for empty object', () => {
        const b = {}
        assert(getFunctionName(b) === '')
    })

    it('should return name, based on props for object', () => {
        const b = {aa: 123, bb: 1}
        assert(getFunctionName(b) === 'aa,bb')
    })

    it('should return empty function name for anonymous functions', () => {
        assert(getFunctionName(() => 0) === '')
    })

    it('should return empty name if empty argument', () => {
        assert.equal(getFunctionName(0), '0')
        assert.equal(getFunctionName(false), 'false')
    })
})
