// @flow
/* eslint-env mocha */

import {spy, match} from 'sinon'
import assert from 'power-assert'

import {
    factory,
    service,
    deps,
    source,
    updaters
} from '../annotations'

import Di from '../Di'
import Updater, {UpdaterStatus} from '../Updater'
import BaseModel from '../BaseModel'

type ModelARec = {
    val?: string;
}

describe('UpdaterStatusTest', () => {
    class ModelA extends BaseModel<ModelARec> {
        val: string
        static defaults: ModelARec = {
            val: '1'
        }
        copy: (rec: ModelARec) => ModelA
    }
    source({key: 'ModelA'})(ModelA)

    class ModelB extends BaseModel<ModelARec> {
        val: string
        static defaults: ModelARec = {
            val: '1'
        }
        copy: (rec: ModelARec) => ModelB
    }
    source({key: 'ModelB'})(ModelB)

    it('pending to complete status change', () => {
        class MyUpdater1 extends Updater {}
        class MyUpdaterStatus extends UpdaterStatus {}
        updaters(MyUpdater1)(MyUpdaterStatus)

        const di = new Di()
        const promise = Promise.resolve({val: 'testA'})
        assert(di.val(MyUpdaterStatus).get().complete)
        di.val(MyUpdater1).get().setSingle(() => promise)
        assert(di.val(MyUpdaterStatus).get().pending)

        return promise.then(() => {
            assert(di.val(MyUpdaterStatus).get().complete)
        })
    })

    it('pending to complete status change from first used and second not used updater', () => {
        class MyUpdater1 extends Updater {}
        class MyUpdater2 extends Updater {}
        class MyUpdaterStatus extends UpdaterStatus {}
        updaters(MyUpdater1, MyUpdater2)(MyUpdaterStatus)

        const di = new Di()
        const promise = Promise.resolve({val: 'testA'})
        di.val(MyUpdater1).get().setSingle(() => promise)

        const u: UpdaterStatus = di.val(MyUpdaterStatus).get()
        assert(u.pending)

        return promise.then(() => {
            assert(di.val(MyUpdaterStatus).get().complete)
        })
    })

    it('pending to complete status change from both used updaters', () => {
        class MyUpdater1 extends Updater {}
        class MyUpdater2 extends Updater {}
        class MyUpdaterStatus extends UpdaterStatus {}
        updaters(MyUpdater1, MyUpdater2)(MyUpdaterStatus)

        const di = new Di()
        const promiseA = Promise.resolve({val: 'testA'})
        di.val(MyUpdater1).get().setSingle(() => promiseA)

        let resolveFn: Function
        const promiseB = new Promise(resolve => {
            resolveFn = resolve
        })
        di.val(MyUpdater2).get().setSingle(() => promiseB)

        const u: UpdaterStatus = di.val(MyUpdaterStatus).get()
        assert(u.pending)

        return promiseA.then(() => {
            assert(di.val(MyUpdaterStatus).get().pending)
            resolveFn({val: 'testB'})

            return promiseB.then(() => {
                assert(di.val(MyUpdaterStatus).get().complete)
            })
        })
    })
})
