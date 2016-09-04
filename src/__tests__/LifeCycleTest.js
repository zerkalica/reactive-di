// @flow
/* eslint-env mocha */

import {spy, stub, match} from 'sinon'
import assert from 'power-assert'
import {Component as ReactComponent, createElement as h} from 'react'
import ReactDOM from 'react-dom/server'
import TestUtils from 'react-addons-test-utils'

import {
    theme,
    hooks,
    component,
    source,
    deps
} from 'reactive-di/annotations'

import type {StyleSheet} from 'reactive-di/interfaces/component'

import {Component} from 'fake-react'
import {Di, Updater} from 'reactive-di/index'
import BaseModel from 'reactive-di/utils/BaseModel'

import createReactWidgetFactory from 'reactive-di/adapters/createReactWidgetFactory'
import createHandlers from 'reactive-di/createHandlers'

function findDOMElement(): HTMLElement {
    throw new Error('get dom element not simport createHandlers unsupported on server')
}

describe('LifeCycleTest', () => {
    type ModelARec = {
        val?: string;
    }

    it('initiate loading on component mount', () => {
        interface ModelARec {
            val?: string;
        }

        const promise: Promise<ModelARec> = Promise.resolve({val: '2'})
        const fakeFetch = spy(() => promise)
        const onMount = spy()
        const onUnmount = spy()

        class Fetcher {
            fetch: (args: Object) => Promise<*> = fakeFetch
        }

        @source({key: 'ModelA'})
        class ModelA {
            val: string

            constructor(rec?: ModelARec = {}) {
                this.val = rec.val || '1'
            }
        }


        @hooks(ModelA)
        @deps(Fetcher, Updater)
        class ModelALifeCycle {
            _fetcher: Fetcher
            _updater: Updater
            _promise: ?Promise<ModelARec>

            constructor(fetcher: Fetcher, updater: Updater) {
                this._fetcher = fetcher
                this._updater = updater
            }

            onUpdate(): void {}

            onMount(model: ModelA) {
                onMount(model)
                const promise: Promise<ModelARec> = this._promise = this._fetcher.fetch({
                    url: '/model-a'
                })
                this._updater.setSingle(promise, ModelA)
            }

            onUnmount(model: ModelARec) {
                onUnmount(model)
                if (this._promise && typeof this._promise.cancel === 'function') {
                    this._promise.cancel()
                }
            }
        }
        interface Props {}
        interface State {
            m: ModelA;
        }

        @deps({m: ModelA})
        @component()
        class ComponentA extends Component<Props, State> {
            props: Props;
            state: State;
            $: HTMLElement;
            render() {
                const {m} = this.state
                return h('div', null, 'testA-' + this.state.m.val)
            }
        }

        @deps({m: ModelA})
        @component()
        class ComponentB extends Component<Props, State> {
            props: Props;
            state: State;
            $: HTMLElement;
            render() {
                const {m} = this.state
                return h('div', null, 'testB-' + this.state.m.val)
            }
        }

        const handlers = createHandlers(createReactWidgetFactory(ReactComponent, findDOMElement))
        const di = new Di(handlers)
        const ComponentAEl = di.val(ComponentA).get()
        const ComponentBEl = di.val(ComponentB).get()
        const componentA = TestUtils.renderIntoDocument(h(ComponentAEl))
        assert(onMount.calledOnce)
        const componentB = TestUtils.renderIntoDocument(h(ComponentBEl))
        assert(onMount.calledOnce)
        assert(onUnmount.notCalled)
        componentA.componentWillUnmount()
        assert(onUnmount.notCalled)
        componentB.componentWillUnmount()
        assert(onUnmount.calledOnce)
    })
})
