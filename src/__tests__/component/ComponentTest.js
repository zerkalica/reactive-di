// @flow
/* eslint-env mocha */

import assert from 'power-assert'

import React from 'react'

import {
    component,
    source,
    deps
} from 'reactive-di/annotations'

import Di from 'reactive-di/core/Di'
import BaseModel from 'reactive-di/utils/BaseModel'

import ReactComponentFactory from 'reactive-di/adapters/ReactComponentFactory'

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

        function TestComponent(props: Props, state: State, _h): mixed {
            return <div>{state.m.val}</div>
        }
        deps({m: ModelA})(TestComponent)
        component()(TestComponent)

        const di = new Di(new ReactComponentFactory(React))

        const TestComponentEl = di.wrapComponent(TestComponent)
        const componentA = render(TestComponentEl)
        assert(findDOMNode(componentA).textContent === 'state-value')
    })
})
