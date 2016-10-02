// @flow
/* eslint-env mocha */

import assert from 'power-assert'

import {
    source
} from 'reactive-di/annotations'

import Di from 'reactive-di/core/Di'
import Updater from 'reactive-di/core/Updater'
import BaseModel from 'reactive-di/utils/BaseModel'

type ModelARec = {
    val?: string;
}

describe('UpdaterTest', () => {
    class ModelA extends BaseModel<ModelARec> {
        val: string
        static defaults: ModelARec = {
            val: '1'
        }
        copy: (rec: ModelARec) => ModelA
    }
    source({key: 'ModelA'})(ModelA)

    it('sync update, using model.constructor', () => {
        const di = new Di()
        const u: Updater = di.val(Updater).get()
        assert(di.val(ModelA).get().val === '1')

        const val = 'test'
        u.set([
            new ModelA({val})
        ])
        assert(u.status.get().complete)
        assert(di.val(ModelA).get().val === val)
    })

    it('sync update, using key-value', () => {
        const di = new Di()
        const u: Updater = di.val(Updater).get()
        assert(di.val(ModelA).get().val === '1')

        const val = 'test'
        u.set([
            [ModelA, new ModelA({val})]
        ])
        assert(u.status.get().complete)
        assert(di.val(ModelA).get().val === val)
    })

    it('async update, using promise', () => {
        const di = new Di()
        const u: Updater = di.val(Updater).get()
        const val = 'test'
        const modelAPromise = Promise.resolve([new ModelA({val})])
        u.set([
            () => modelAPromise
        ])
        return modelAPromise.then(() => {
            assert(di.val(ModelA).get().val === val)
        })
    })

    it('async update, using observable', () => {
        const di = new Di()
        const u: Updater = di.val(Updater).get()
        const val = 'test1'
        const val2 = 'test2'
        let resolve1: Function
        let resolve2: Function
        const promise1 = new Promise((r) => {
            resolve1 = r
        })
        const promise2 = new Promise((r) => {
            resolve2 = r
        })
        const modelAObservable = new Observable((observer: Observer<ModelA | ModelA[], Error>) => {
            setTimeout(() => {
                observer.next([new ModelA({val})])
                resolve1()
                setTimeout(() => {
                    observer.complete([new ModelA({val: val2})])
                    resolve2()
                }, 0)
            }, 0)
        })

        u.set([
            new ModelA({val: 'test0'}),
            () => modelAObservable
        ])

        assert(di.val(ModelA).get().val === 'test0')

        return promise1
            .then(() => {
                assert(u.status.get().pending)
                assert(di.val(ModelA).get().val === val)
                return promise2
            })
            .then(() => {
                assert(u.status.get().complete)
                assert(di.val(ModelA).get().val === val2)
            })
    })
})
