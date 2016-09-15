// @flow
/* eslint-env mocha */

import {spy, match} from 'sinon'
import assert from 'power-assert'

import {
    factory,
    updaters,
    component,
    hooks,
    deps,
    source
} from 'reactive-di/annotations'

import {Di, Updater} from 'reactive-di/index'
import BaseModel from 'reactive-di/utils/BaseModel'
import type {CreateControllable, IComponentControllable} from 'reactive-di/interfaces/component'
import type {Derivable} from 'reactive-di/interfaces/atom'
import type {SingleUpdate} from 'reactive-di/interfaces/updater'
import ComponentControllable from 'reactive-di/core/ComponentControllable'

describe('InitializerTest', () => {
    class BaseModel {
        val: string
        static defaults: $Shape<BaseModel> = {
            val: 'null'
        }
        constructor(props?: $Shape<BaseModel> = {}) {
            Object.assign((this: Object), this.constructor.defaults, props)
        }
        copy(props: $Shape<BaseModel>): BaseModel {
            return new this.constructor({...(this: Object), ...props})
        }
    }

    function createComponent(update) {
        @deps(Di)
        class ModelAUpdater extends Updater {}

        @source({key: 'ModelA'})
        class ModelA extends BaseModel {
            static Updater: Class<Updater> = ModelAUpdater
        }

        @hooks(ModelA)
        @deps(ModelAUpdater)
        class ModelALC {
            _updater: Updater

            constructor(updater: ModelAUpdater) {
                this._updater = updater
            }

            onUpdate() {}

            onMount() {
                this._updater.setSingle(update, ModelA)
            }

            onUnmount() {
                this._updater.cancel()
            }
        }

        @component()
        @deps({m: ModelA})
        class Component {
            m: ModelA
            ctl: IComponentControllable<*, *>
            static info: any

            constructor() {
                // console.log(this.constructor.info)
                this.ctl = new ComponentControllable(this.constructor.info, (state) => this.setState(state))
                Object.assign(this, this.ctl.getState())
            }
            setState(state) {
                Object.assign(this, state)
            }
        }

        const di = new Di({
            createElement(h) {
                return h
            },
            wrapComponent(info: any): any {
                info.target.info = info
                return (info.target: any)
            }
        }).register([Updater])
        const C: Class<Component> = di.wrapComponent((Component: any))
        const c = new C()
        return c
    }

    it('sync model changes on component mount', () => {
        const c = createComponent({
            val: 'updated'
        })
        assert(c.m.val === 'null')
        c.ctl.onMount()
        assert(c.m.val === 'updated')
        c.ctl.onUnmount()
    })

    it('cancel on unmount async model changes', () => {
        const result = Promise.resolve({val: 'async-updated'})

        const c = createComponent(
            () => result
        )
        assert(c.m.val === 'null')
        c.ctl.onMount()
        assert(c.m.val === 'null')
        c.ctl.onUnmount()

        return result.then(() => {
            assert(c.m.val === 'null')
        })
    })

    it('async model changes', () => {
        const result = Promise.resolve({val: 'async-updated'})

        const c = createComponent(
            () => result
        )
        assert(c.m.val === 'null')
        c.ctl.onMount()
        assert(c.m.val === 'null')

        return result.then(() => {
            assert(c.m.val === 'async-updated')
            c.ctl.onUnmount()
        })
    })

    it('async and sync model changes', () => {
        const result = Promise.resolve({val: 'async-updated'})

        const c = createComponent([
            {val: 'sync-updated'},
            () => result
        ])
        assert(c.m.val === 'null')
        c.ctl.onMount()
        assert(c.m.val === 'sync-updated')

        return result.then(() => {
            assert(c.m.val === 'async-updated')
            c.ctl.onUnmount()
        })
    })
})
