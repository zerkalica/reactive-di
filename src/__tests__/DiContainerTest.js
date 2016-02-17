/* eslint-env mocha */
/* @flow */

import assert from 'power-assert'
import sinon from 'sinon'

import annotations from 'reactive-di/__tests__/annotations'
import createPureStateDi from 'reactive-di/createPureStateDi'

const {
    model,
    klass,
    factory
} = annotations

class AppState {}
model(AppState)

describe('DiContainerTest', () => {
    describe('basics', () => {
        it('should throws exception if incorrect data passed to constructor', () => {
            assert.throws(() => createPureStateDi({}), /not annotated/)
        })
    })

    describe('get', () => {
        it('should throws exception if no decorated function passed', () => {
            const di = createPureStateDi(new AppState())
            function WrongDep() {}

            assert.throws(() => di(WrongDep), /not annotated dependency/)
        })

        it('should return class instance', () => {
            const di = createPureStateDi(new AppState())
            class Test {}
            klass()(Test)
            const instance = di(Test)
            assert(instance instanceof Test)
        })

        it('should cache class instance', () => {
            const di = createPureStateDi(new AppState())
            class TestBase {}
            const Test = sinon.spy(TestBase)
            klass()(Test)
            const instance1 = di(Test)
            const instance2 = di(Test)
            assert(instance1 === instance2)
            assert(Test.calledOnce)
        })

        it('should cache factory return value', () => {
            const di = createPureStateDi(new AppState())
            function testBase() {
                return 123
            }
            const test = sinon.spy(testBase)
            factory()(test)

            di(test)
            const instance1 = di(test)
            assert(instance1 === 123)
            assert(test.calledOnce)
        })

        it('should handle simple deps from array definition', () => {
            const di = createPureStateDi(new AppState())
            function MyDep() {
                return 123
            }
            factory()(MyDep)
            class Test {}
            const TestFake = sinon.spy(Test)
            klass(MyDep)(TestFake)

            di(TestFake)
            assert(TestFake.calledWith(123))
        })

        it('should handle simple deps from object definition', () => {
            const di = createPureStateDi(new AppState())
            function MyDep() {
                return 123
            }
            factory()(MyDep)
            class Test {}
            const TestFake = sinon.spy(Test)
            klass({fac: MyDep})(TestFake)

            di(TestFake)
            assert(TestFake.calledWith({fac: 123}))
        })
    })
})
