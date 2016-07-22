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
import Updater from '../Updater'
import UpdaterStatus from '../UpdaterStatus'
import BaseModel from '../BaseModel'

type ModelARec = {
    val?: string;
}

describe('UpdaterStatusTest', () => {
    class ModelA extends BaseModel<ModelARec> {
        val: string;
        static defaults: ModelARec = {
            val: '1'
            };
        copy: (rec: ModelARec) => ModelA;
    }
    source({key: 'ModelA'})(ModelA)
    class ModelB extends BaseModel<ModelARec> {
        val: string;
        static defaults: ModelARec = {
            val: '1'
            };
        copy: (rec: ModelARec) => ModelB;
    }
    source({key: 'ModelB'})(ModelB)

    it('pending to complete status change', () => {
        const di = new Di()
        class MyUpdater1 extends Updater {
            static pending: boolean = true;
        }
        const promise = Promise.resolve(new ModelA({val: 'testA'}))
        function loadModelA(updater: MyUpdater1): () => void {
            return () => {
                updater.set([
                    () => promise
                ])
            }
        }
        deps(MyUpdater1)(loadModelA)

        class MyUpdaterStatus extends UpdaterStatus {}
        updaters(MyUpdater1)(MyUpdaterStatus)

        const u: UpdaterStatus = di.val(MyUpdaterStatus).get()
        assert(u.type === 'pending')
        di.val(loadModelA).get()()

        return promise.then(() => {
            const u2: UpdaterStatus = di.val(MyUpdaterStatus).get()
            assert(u2.type === 'complete')
        })
    })

    it('initial status from two updaters with different initial statuses', () => {
        const di = new Di()
        class MyUpdater1 extends Updater {
            static pending: boolean = true;
        }
        class MyUpdater2 extends Updater {
            static pending: boolean = false;
        }

        class MyUpdaterStatus extends UpdaterStatus {}
        updaters(MyUpdater1, MyUpdater2)(MyUpdaterStatus)

        const u: UpdaterStatus = di.val(MyUpdaterStatus).get()
        assert(u.type === 'pending')
    })

    it('pending to complete status change from two updaters with different initial statuses', () => {
        const di = new Di()
        class MyUpdater1 extends Updater {
            static pending: boolean = true;
        }
        class MyUpdater2 extends Updater {
            static pending: boolean = false;
        }
        const promise = Promise.resolve(new ModelA({val: 'testA'}))
        function loadModelA(updater: MyUpdater1): () => void {
            return () => {
                updater.set([
                    () => promise
                ])
            }
        }
        deps(MyUpdater1)(loadModelA)

        class MyUpdaterStatus extends UpdaterStatus {}
        updaters(MyUpdater1, MyUpdater2)(MyUpdaterStatus)

        const u: UpdaterStatus = di.val(MyUpdaterStatus).get()
        assert(u.type === 'pending')
        di.val(loadModelA).get()()

        return promise.then(() => {
            const u2: UpdaterStatus = di.val(MyUpdaterStatus).get()
            assert(u2.type === 'complete')
        })
    })

    it('pending to complete status change from two updaters with pending initial statuses', () => {
        const di = new Di()
        class MyUpdater1 extends Updater {
            static pending: boolean = true;
        }
        class MyUpdater2 extends Updater {
            static pending: boolean = true;
        }
        const promise1 = Promise.resolve(new ModelA({val: 'testA'}))
        const promise2 = Promise.resolve(new ModelB({val: 'testB'}))
        function loadModelA(updater: MyUpdater1): () => void {
            return () => {
                updater.set([
                    () => promise1
                ])
            }
        }
        deps(MyUpdater1)(loadModelA)
        function loadModelB(updater: MyUpdater2): () => void {
            return () => {
                updater.set([
                    () => promise2
                ])
            }
        }
        deps(MyUpdater2)(loadModelB)

        class MyUpdaterStatus extends UpdaterStatus {}
        updaters(MyUpdater1, MyUpdater2)(MyUpdaterStatus)

        di.val(loadModelA).get()()
        di.val(loadModelB).get()()

        return promise1
            .then(() => {
                return promise2
            })
            .then(() => {
                const u2: UpdaterStatus = di.val(MyUpdaterStatus).get()
                assert(u2.type === 'complete')
            })
    })
})
