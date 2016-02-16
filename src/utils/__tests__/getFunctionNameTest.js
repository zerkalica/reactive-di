/* eslint-env mocha */
/* @flow */
import getFunctionName from '~/utils/getFunctionName'
import assert from 'power-assert'

describe('getFunctionName', () => {
    it('should return valid function name', () => {
        function test() {
        }

        assert(getFunctionName(test) === 'test')
    })

    it('should return empty function name for anonymous functions', () => {
        assert(getFunctionName(() => 0) === '')
    })

    it('should throw error if undefined argument', () => {
        assert.throws(() => getFunctionName())
        assert.throws(() => getFunctionName(null))
    })

    it('should return empty name if empty argument', () => {
        assert.equal(getFunctionName(0), '')
        assert.equal(getFunctionName(false), '')
    })
})
