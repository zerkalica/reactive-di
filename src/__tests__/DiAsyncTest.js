/* eslint-env mocha */
/* @flow */

import assert from 'power-assert'
import sinon from 'sinon'

import annotations from 'reactive-di/__tests__/annotations'
import createPureStateDi from 'reactive-di/createPureStateDi'
import promiseToObservable from 'reactive-di/utils/promiseToObservable'

const {
    model,
    meta,
    asyncmodel,
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
            asyncmodel(C)

            const dataSource = Promise.resolve(new C('test2'))

            function cLoader(c: C): Observable<C, Error> { // eslint-disable-line
                return promiseToObservable(dataSource)
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

            const di = createPureStateDi(new AppState())
            const MyDep = sinon.spy((c: C, meta: EntityMeta) => ({v: c.v, meta}))
            factory(cLoader, meta(cLoader))(MyDep)

            assert.deepEqual(di(MyDep), {
                v: 'test1',
                meta: {
                    fulfilled: false,
                    pending: true,
                    reason: null,
                    rejected: false
                }
            })

            return dataSource.then(() => {
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

        it('should load')
    })
})
