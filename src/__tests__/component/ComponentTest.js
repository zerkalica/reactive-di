// @flow
/* eslint-env mocha */

import {spy, match} from 'sinon'
import assert from 'power-assert'

import React from 'react'
import ReactDOM from 'react-dom/server'

import {
    theme,
    component,
    source,
    deps
} from 'reactive-di/annotations'

import type {StyleSheet} from 'reactive-di/interfaces/component'

import {Component} from 'fake-react'
import Di from 'reactive-di/Di'
import BaseModel from 'reactive-di/utils/BaseModel'

import createReactWidgetFactory from 'reactive-di/adapters/createReactWidgetFactory'
import createHandlers from 'reactive-di/createHandlers'

import {renderIntoDocument} from 'react-addons-test-utils'
import {findDOMNode} from 'react-dom'

function render(raw) {
    return renderIntoDocument(React.createElement(raw))
}

describe('ComponentTest', () => {
    type ModelARec = {
        val?: string;
    }

    it('render via state changes', () => {
        @source({key: 'ModelA'})
        class ModelA extends BaseModel<ModelARec> {
            val: string;
            static defaults: ModelARec = {
                val: 'state-value'
            };
            copy: (rec: ModelARec) => ModelA;
        }

        interface Props {}
        interface State {
            m: ModelA;
        }

        function TestComponent(props: Props, state: State, h): mixed {
            return <div>{state.m.val}</div>
        }
        deps({m: ModelA})(TestComponent)
        component()(TestComponent)
        const handlers = createHandlers(createReactWidgetFactory(React))

        const di = new Di(handlers)

        const TestComponentEl = di.val(TestComponent).get()
        const componentA = render(TestComponentEl)
        assert(findDOMNode(componentA).textContent === 'state-value')
    })
})
