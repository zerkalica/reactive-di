// @flow
/* eslint-env mocha */

import {spy, match} from 'sinon'
import assert from 'power-assert'

import {
    factory,
    updaters,
    service,
    deps,
    source
} from 'reactive-di/annotations'

import Di from 'reactive-di/Di'
import Updater from 'reactive-di/Updater'
import BaseModel from 'reactive-di/utils/BaseModel'
import type {Derivable} from 'reactive-di/interfaces/atom'
import type {SingleUpdate} from 'reactive-di/interfaces/updater'

describe('InitializerTest', () => {
    class Dep {
        val: string = 'test'
    }

    class BaseModel {
        val: string
        static defaults: $Shape<BaseModel> = {
            val: ''
        }
        constructor(props?: $Shape<BaseModel> = {}) {
            Object.assign((this: Object), this.constructor.defaults, props)
        }
        copy(props: $Shape<BaseModel>): BaseModel {
            return new this.constructor({...(this: Object), ...props})
        }
    }

    it('sync model changes in service throught facet', () => {
        class ModelA extends BaseModel {}
        function initA(dep: Dep): $Shape<ModelA> {
            return {
                val: dep.val
            }
        }
        factory(initA)
        deps(Dep)(initA)
        source({key: 'ModelA', updater: Updater, loader: initA})(ModelA)

        const Service = spy(class {
            m: ModelA
            constructor(m: ModelA) {
                this.m = m
            }
        })
        deps(ModelA)(Service)

        const di = new Di()
        const s: Service = di.val(Service).get()

        assert(s.m.val === 'test')
        assert(s.m instanceof ModelA)
    })

    it('async model changes', () => {
        class ModelA extends BaseModel {}
        const result = Promise.resolve({val: 'test2'})

        function initA(dep: Dep): () => Promise<$Shape<ModelA>> {
            return () => result
        }
        factory(initA)
        deps(Dep, Updater)(initA)
        source({key: 'ModelA', updater: Updater, loader: initA})(ModelA)

        const di = new Di()
        const m: Derivable<ModelA> = di.val(ModelA)
        const firstInstance = m.get()
        assert(firstInstance.val === '')

        return result.then(() => {
            const secondInstance = m.get()
            assert(secondInstance.val === 'test2')
            assert(secondInstance instanceof ModelA)
            assert(secondInstance !== firstInstance)
        })
    })

    it('mixed async and sync model changes', () => {
        class ModelA extends BaseModel {}
        const result = Promise.resolve({val: 'test2'})

        function initA(dep: Dep): [$Shape<ModelA>, () => Promise<$Shape<ModelA>>] {
            return [
                {
                    val: dep.val
                },
                () => result
            ]
        }
        factory(initA)
        deps(Dep, Updater)(initA)
        source({key: 'ModelA', updater: Updater, loader: initA})(ModelA)

        const di = new Di()
        const m: Derivable<ModelA> = di.val(ModelA)
        assert(m.get().val === 'test')

        return result.then(() => {
            assert(m.get().val === 'test2')
            assert(m.get() instanceof ModelA)
        })
    })
})
