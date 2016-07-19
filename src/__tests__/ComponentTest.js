// @flow
/* eslint-env mocha */

import {spy, match} from 'sinon'
import assert from 'power-assert'

import {Component as ReactComponent, createElement as h} from 'react'
import ReactDOM from 'react-dom/server'

import {
    component,
    source,
    deps,
    klass
} from '../annotations'

import type {
    Derivable
} from '../adapters/Adapter'
import {Component} from '../index'
import Di from '../Di'
import BaseModel from '../BaseModel'

import createReactWidgetFactory from '../createReactWidgetFactory'

describe('ComponentTest', () => {
    type ModelARec = {
        val?: string;
    }

    it('component state changes', () => {
        class ModelA extends BaseModel<ModelARec> {
            val: string;
            static defaults: ModelARec = {
                val: 'state-value'
            };
            copy: (rec: ModelARec) => ModelA;
        }
        klass(ModelA)
        source({key: 'ModelA'})(ModelA)

        // theme()(TestComponent)
        class TestComponent extends Component<Props, State> {
            props: Props;
            state: State;
            render() {
                return h('div', null, 'test-' + this.state.m.val)
            }
        }
        deps([{
            m: ModelA
        }])(TestComponent)
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

        di.val(ModelA).set(new ModelA({val: '123'}))

        assert(
            ReactDOM.renderToString(h(c, {
                prop: 'test'
            }))
            ===
            '<div data-reactroot="" data-reactid="1" data-react-checksum="-19066403">test-123</div>'
        )
    })
})
