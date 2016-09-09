// @flow
/* eslint-env mocha */

import {spy, match} from 'sinon'
import assert from 'power-assert'

import {
    service,
    abstract,
    deps,
    source,
    factory
} from 'reactive-di/annotations'

import Di from 'reactive-di/core/Di'
import BaseModel from 'reactive-di/utils/BaseModel'
import type {Middleware, ArgsInfo} from 'reactive-di/utils/MiddlewareFactory'

describe('MiddlewareTest', () => {
    it('exec on method call', () => {
        const addLog = spy()
        class Mdl1 {
            exec<R>(fn: (args: any[]) => R, args: any[], info: ArgsInfo): R {
                addLog(fn, args, info)
                return fn(args) + 'c'
            }
        }
        class Service {
            add(a: string): string {
                return a + 'b'
            }
        }
        const di = (new Di()).middlewares([Mdl1])
        assert(di.val(Service).get().add('a') === 'abc')
        assert(addLog.calledOnce)
    })

    it('order of middleware calls', () => {
        const addLog = spy()
        class Mdl1 {
            exec<R>(fn: (args: any[]) => R, args: any[], info: ArgsInfo): R {
                addLog(fn, args, info)
                return fn(args) + 'c'
            }
        }
        class Mdl2 {
            exec<R>(fn: (args: any[]) => R, args: any[], info: ArgsInfo): R {
                addLog(fn, args, info)
                return fn(args) + 'd'
            }
        }
        class Service {
            add(a: string): string {
                return a + 'b'
            }
        }
        const di = (new Di()).middlewares([Mdl1, Mdl2])
        assert(di.val(Service).get().add('a') === 'abdc')
        assert(addLog.calledTwice)
    })
})
