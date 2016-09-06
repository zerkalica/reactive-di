// @flow
/* eslint-env mocha */
/* jsx-pragma h */

import {spy, stub, match} from 'sinon'
import assert from 'power-assert'
import React from 'react'
import {renderIntoDocument} from 'react-addons-test-utils'
import {findDOMNode} from 'react-dom'

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

import createReactWidgetFactory from 'reactive-di/adapters/createReactWidgetFactory'
import createHandlers from 'reactive-di/createHandlers'

function render(raw) {
    return renderIntoDocument(React.createElement(raw))
}

describe('LifeCycleInDepsTest', () => {
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
        const onUpdate = spy()

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

            onUpdate(oldModelA: ModelA, newModelA: ModelA): void {
                onUpdate(oldModelA, newModelA)
            }

            onMount(model: ModelA) {
                onMount(model)
                const promise: Promise<ModelARec> = this._promise = this._fetcher.fetch({
                    url: '/model-a'
                })
                this._updater.setSingle(() => promise, ModelA)
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

        function ComponentA(props: Props, state: State, h: Function): React$Element<any> {
            return <div>testA-{state.m.val}</div>
        }
        deps({m: ModelA})(ComponentA)
        component()(ComponentA)

        function ComponentB(props: Props, state: State, h: Function): React$Element<any> {
            return <div>testB-{state.m.val}</div>
        }
        deps({m: ModelA})(ComponentB)
        component()(ComponentB)

        const handlers = createHandlers(createReactWidgetFactory(React))
        const di = new Di(handlers)

        const ComponentAEl = di.val(ComponentA).get()
        const ComponentBEl = di.val(ComponentB).get()
        const componentA = render(ComponentAEl)
        console.log(findDOMNode(componentA).textContent)
        assert(findDOMNode(componentA).textContent === 'testA-1')

        const componentB = render(ComponentBEl)
        assert(findDOMNode(componentB).textContent === 'testB-1')
        assert(onUpdate.notCalled)

        return promise.then(() => {
            const componentA2 = render(ComponentAEl)
            const componentB2 = render(ComponentBEl)
            assert(findDOMNode(componentA2).textContent === 'testA-2')
            assert(findDOMNode(componentB2).textContent === 'testB-2')
            assert(onUpdate.calledOnce)

            componentA.componentWillUnmount()
            componentA2.componentWillUnmount()
            componentB2.componentWillUnmount()
            assert(onUnmount.notCalled)
            componentB.componentWillUnmount()
            assert(onMount.calledOnce)
            assert(onUnmount.calledOnce)
        })
    })
})
