/* @flow */
/* eslint-env mocha */

import assert from 'power-assert'
import createProxy from '../createProxy'
import {spy} from 'sinon'

describe('createProxyTest', () => {
    describe('function proxy', () => {
        function myFunc(): string {
            return 'retVal'
        }

        it('should call function proxy with result and args of origin', () => {
            const middleware = spy()
            const proxified = createProxy(myFunc, [middleware])
            proxified(1, 2, 'test')
            assert(middleware.calledOnce)
            assert(middleware.firstCall.calledWith('retVal', 1, 2, 'test'))
        })

        it('should pass origin return result to proxy', () => {
            const middleware = spy()
            const proxified = createProxy(myFunc, [middleware])
            const val = proxified(1, 2, 'test')
            assert(val === 'retVal')
        })

        it('should handle multiple middlewares', () => {
            const middleware1 = spy()
            const middleware2 = spy()
            const proxified = createProxy(myFunc, [middleware1, middleware2])
            proxified(1, 2, 'test')
            assert(middleware1.calledOnce)
            assert(middleware2.calledOnce)
            assert(middleware1.firstCall.calledWith('retVal', 1, 2, 'test'))
            assert(middleware2.firstCall.calledWith('retVal', 1, 2, 'test'))
        })
    })

    describe('object proxy', () => {
        class My {
            a(val: string): string {
                return val + '1'
            }

            b(val: number): number {
                return val + 1
            }
        }

        it('should return same instance of proxified class', () => {
            const middleware = {
                a: spy()
            }
            const original = new My()
            const proxified = createProxy(original, [middleware])

            assert(proxified instanceof My)
            assert(proxified !== original)
        })

        it('should call origin method and call middleware with result and args', () => {
            const middleware = {
                a: spy()
            }
            const original = new My()
            const proxified = createProxy(original, [middleware])
            const valA = proxified.a('test')

            assert(valA === 'test1')
            assert(middleware.a.firstCall.calledWith('test1', 'test'))
        })

        it('should pass non-proxified properties', () => {
            const middleware = {
                a: spy()
            }
            const original = new My()
            const proxified = createProxy(original, [middleware])
            const valA = proxified.b(123)
            assert(proxified.b !== original.b)
            assert(valA === 124)
        })

        it('should handle multiple middlewares', () => {
            const middleware1 = {a: spy()}
            const middleware2 = {a: spy()}
            const original = new My()
            const proxified = createProxy(original, [middleware1, middleware2])
            proxified.a('test')
            assert(middleware1.a.calledOnce)
            assert(middleware2.a.calledOnce)
            assert(middleware1.a.firstCall.calledWith('test1', 'test'))
            assert(middleware2.a.firstCall.calledWith('test1', 'test'))
        })
    })
})
