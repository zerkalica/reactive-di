// @flow
import {spy} from 'sinon'
import assert from 'power-assert'
import type {ArgsInfo, Middleware} from 'reactive-di/utils/MiddlewareFactory'
import MiddlewareFactory from 'reactive-di/utils/MiddlewareFactory'

describe('MiddlewareFactoryTest', () => {
    describe('wrap functions', () => {
        it('should modify value', () => {
            class Mdl1 {
                exec<R>(resolve: (args: any[]) => R, args: any[], info: ArgsInfo): R {
                    const result: R = resolve(args)
                    // console.log(`${info.id} called`)
                    return result + 'c'
                }
            }

            const wrapper = new MiddlewareFactory([new Mdl1()])
            function testFunc(a: string): string {
                return a + 'b'
            }
            const newFunc = wrapper.wrap(testFunc, 'facet')

            assert(newFunc('a') === 'abc')
        })

        it('should apply from last to first', () => {
            class Mdl1 {
                exec<R>(resolve: (args: any[]) => R, args: any[], info: ArgsInfo): R {
                    const result: R = resolve(args)
                    return result + 'c'
                }
            }
            class Mdl2 {
                exec<R>(resolve: (args: any[]) => R, args: any[], info: ArgsInfo): R {
                    const result: R = resolve(args)
                    return result + 'd'
                }
            }

            const wrapper = new MiddlewareFactory([new Mdl1(), new Mdl2()])
            function testFunc(a: string): string {
                return a + 'b'
            }
            const newFunc = wrapper.wrap(testFunc, 'facet')

            assert(newFunc('a') === 'abdc')
        })

        it('should apply only matched middlewares', () => {
            class Mdl1 {
                exec<R>(resolve: (args: any[]) => R, args: any[], info: ArgsInfo): R {
                    const result: R = resolve(args)
                    if (info.id !== 'testFuncB') {
                        return result
                    }
                    return result + 'c'
                }
            }
            class Mdl2 {
                exec<R>(resolve: (args: any[]) => R, args: any[], info: ArgsInfo): R {
                    const result: R = resolve(args)
                    return result + 'd'
                }
            }

            const wrapper = new MiddlewareFactory([new Mdl1(), new Mdl2()])
            function testFuncA(a: string): string {
                return a + 'b'
            }
            const newFuncA = wrapper.wrap(testFuncA, 'facetA')

            function testFuncB(a: string): string {
                return a + 'b'
            }
            const newFuncB = wrapper.wrap(testFuncB, 'facetB')

            assert(newFuncA('a') === 'abd')
            assert(newFuncB('a') === 'abdc')
        })
    })

    describe('wrap classes', () => {
        it('should wrap class methods', () => {
            class Mdl1 {
                exec<R>(resolve: (args: any[]) => R, args: any[], info: ArgsInfo): R {
                    const result: R = resolve(args)
                    // console.log(`${info.id} called`)
                    return result + 'c'
                }
            }

            const wrapper = new MiddlewareFactory([new Mdl1()])

            class TestClass {
                a: string = '1'
                add(a: string): string {
                    return a + 'b'
                }
            }
            const testClass = new TestClass()
            const newClass = wrapper.wrap(testClass, 'service')
            assert(newClass instanceof TestClass)
            assert(newClass.add('a') === 'abc')
            assert(newClass.a === '1')
        })

        it('should log property get', () => {
            const access = spy()
            class Mdl1 {
                get<R>(result: R, info: ArgsInfo): R {
                    access(result, info)
                    return result
                }
            }

            const wrapper = new MiddlewareFactory([new Mdl1()])

            class TestClass {
                a: string = '1'
            }
            const testClass = new TestClass()
            const newClass = wrapper.wrap(testClass, 'service')
            assert(access.notCalled)
            assert(newClass.a === '1')
            assert(access.calledOnce)
        })

        it('should modify on get', () => {
            class Mdl1 {
                get<R>(result: R, info: ArgsInfo): R {
                    return result + '2'
                }
            }

            const wrapper = new MiddlewareFactory([new Mdl1()])

            class TestClass {
                a: string = '1'
            }
            const testClass = new TestClass()
            const newClass = wrapper.wrap(testClass, 'service')
            assert(newClass.a === '12')
        })

        it('should log property set', () => {
            const setValue = spy()
            class Mdl1 {
                set<R>(oldValue: R, newValue: R, info: ArgsInfo): R {
                    setValue(oldValue, newValue, info)
                    return newValue
                }
            }

            const wrapper = new MiddlewareFactory([new Mdl1()])

            class TestClass {
                a: string = '1'
            }
            const testClass = new TestClass()
            const newClass = wrapper.wrap(testClass, 'service')
            assert(setValue.notCalled)
            newClass.a = '2'
            assert(setValue.calledOnce)
        })

        it('should modify on set', () => {
            class Mdl1 {
                set<R>(oldValue: R, newValue: R, info: ArgsInfo): R {
                    return newValue + 'a'
                }
            }

            const wrapper = new MiddlewareFactory([new Mdl1()])

            class TestClass {
                a: string = '1'
            }
            const testClass = new TestClass()
            const newClass = wrapper.wrap(testClass, 'service')
            newClass.a = '2'
            assert(newClass.a === '2a')
        })
    })
})
