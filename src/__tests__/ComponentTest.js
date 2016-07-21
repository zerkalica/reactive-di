// @flow
/* eslint-env mocha */

import {spy, match} from 'sinon'
import assert from 'power-assert'

import {Component as ReactComponent, createElement as h} from 'react'
import ReactDOM from 'react-dom/server'

import {
    theme,
    component,
    source,
    deps,
    klass
} from '../annotations'

import type {StyleSheet} from '../interfaces/component'

import {Component} from 'fake-react'
import Di from '../Di'
import BaseModel from '../BaseModel'

import createReactWidgetFactory from '../adapters/createReactWidgetFactory'

describe('ComponentTest', () => {
    type ModelARec = {
        val?: string;
    }

    it('render via state changes', () => {
        class ModelA extends BaseModel<ModelARec> {
            val: string;
            static defaults: ModelARec = {
                val: 'state-value'
            };
            copy: (rec: ModelARec) => ModelA;
        }
        klass(ModelA)
        source({key: 'ModelA'})(ModelA)

        interface Props {}
        interface State {
            m: ModelA;
        }
        class TestComponent extends Component<Props, State> {
            props: Props;
            state: State;
            $: HTMLElement;
            render() {
                const {m} = this.state
                return h('div', null, 'test-' + this.state.m.val)
            }
        }
        deps({m: ModelA})(TestComponent)
        component()(TestComponent)

        const di = new Di(createReactWidgetFactory(ReactComponent, () => {
            throw new Error('get dom element not supported on server')
        }))
        const c = di.val(TestComponent).get()

        assert(
            ReactDOM.renderToString(h(c, {
                prop: 'test'
            }))
            ===
            '<div data-reactroot="" data-reactid="1" data-react-checksum="-1437592142">test-state-value</div>'
        )

        di.atom(ModelA).set(new ModelA({val: '123'}))

        assert(
            ReactDOM.renderToString(h(c, {
                prop: 'test'
            }))
            ===
            '<div data-reactroot="" data-reactid="1" data-react-checksum="-19066403">test-123</div>'
        )
    })

    it('attach theme', () => {
        class ModelA extends BaseModel<ModelARec> {
            val: string;
            static defaults: ModelARec = {
                val: 'state-value'
            };
            copy: (rec: ModelARec) => ModelA;
        }
        klass(ModelA)
        source({key: 'ModelA'})(ModelA)

        class TestComponentTheme {
            mainStyle: string;
            __css: mixed;
            constructor() {
                this.__css = {
                    mainStyle: {
                        border: '1px solid red'
                    }
                }
            }
        }
        klass(TestComponentTheme)
        theme(TestComponentTheme)

        interface Props {
            test: string;
        }
        interface State {
            t: TestComponentTheme;
        }
        class TestComponent extends Component<Props, State> {
            props: Props;
            state: State;
            $: HTMLElement;

            render() {
                const {t} = this.state
                return h('div', {className: t.mainStyle}, this.props.test)
            }
        }
        deps({t: TestComponentTheme})(TestComponent)
        component()(TestComponent)

        const fakeSheet: StyleSheet = {
            attach: spy(),
            detach: spy(),
            classes: {
                mainStyle: 'testStyleName'
            }
        }
        const createSheet = spy((css: {[id: string]: Object}) => {
            return fakeSheet
        })
        const di = new Di(createReactWidgetFactory(ReactComponent, () => {
            throw new Error('get dom element not supported on server')
        }), createSheet)

        const c = di.val(TestComponent).get()
        assert(di.val(TestComponentTheme).get().mainStyle === fakeSheet.classes.mainStyle)
        assert(
            ReactDOM.renderToString(h(c, {
                test: 'test'
            }))
            ===
            '<div class="testStyleName" data-reactroot="" data-reactid="1" data-react-checksum="-1443096285">test</div>'
        )
    })
})
