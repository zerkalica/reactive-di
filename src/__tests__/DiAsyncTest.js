/* eslint-env mocha */
/* @flow */

import assert from 'power-assert'
import sinon from 'sinon'

import annotations from 'reactive-di/__tests__/annotations'
import createPureStateDi from 'reactive-di/createPureStateDi'
import defaultPlugins from 'reactive-di/defaultPlugins'

import type {
    AsyncResult,
    EntityMeta
} from 'reactive-di/i/plugins/setterInterfaces'
const {
    model,
    meta,
    factory,
    loader
} = annotations

describe('DiAsyncTest', () => {
    describe('loading data', () => {
        it('should load async data', (): Promise<void> => {
            class C {
                v: string;
                constructor(v: string = 'test1') {
                    this.v = v
                }
            }
            model(C)
            let resolveData: Function;
            const dataSource = new Promise((resolve) => {
                resolveData = resolve
            })
            function cLoader(c: C): AsyncResult<C, Error> {
                return [c, dataSource]
            }
            loader(C)(cLoader)

            class AppState {
                c: C = new C();
                copy(rec: {c?: C}): AppState {
                    const next = new AppState()
                    next.c = rec.c || this.c
                    return next
                }
            }
            model(AppState)

            const di = createPureStateDi(new AppState(), [], defaultPlugins)
            const MyDep = sinon.spy((c: C, m: EntityMeta) => ({v: c.v, meta: m}))
            factory(cLoader, meta(cLoader))(MyDep)

            resolveData(new C('test2'))
            return dataSource.then(() => {
                assert.deepEqual(di(MyDep), {
                    v: 'test1',
                    meta: {
                        fulfilled: true,
                        pending: false,
                        reason: null,
                        rejected: false
                    }
                })

                return Promise.resolve().then(() => {
                    assert.deepEqual(di(MyDep), {
                        v: 'test1',
                        meta: {
                            fulfilled: false,
                            pending: true,
                            reason: null,
                            rejected: false
                        }
                    })

                    return Promise.resolve().then(() => {
                        assert.deepEqual(di(MyDep), {
                            v: 'test2',
                            meta: {
                                fulfilled: true,
                                pending: false,
                                reason: null,
                                rejected: false
                            }
                        })
                    })
                })
            })
        })

        it('should load')
    })
})
