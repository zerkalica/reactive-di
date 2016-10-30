// @flow
/* eslint-env mocha */

import {spy} from 'sinon'
import assert from 'power-assert'

import React from 'react'

import {
    hooks,
    component,
    source,
    deps
} from 'reactive-di/annotations'


import Di from 'reactive-di/core/Di'
import BaseModel from 'reactive-di/utils/BaseModel'

import ReactComponentFactory from 'reactive-di/adapters/ReactComponentFactory'

import {renderIntoDocument} from 'react-addons-test-utils'

type ReactComponent<Props, State> = React$Component<*, Props, State>

function render(raw: mixed) {
    return renderIntoDocument(React.createElement(raw))
}

describe('LifeCycleTest', () => {
    type ModelARec = {
        val?: string;
    }

    it('handle lc updates', () => {
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

        function TestComponent(props: Props, state: State, _h: mixed): mixed {
            return <div>{state.m.val}</div>
        }
        deps({m: ModelA})(TestComponent)
        component()(TestComponent)

        const onMount = spy()
        const onUpdate = spy()

        @hooks(TestComponent)
        class TestComponentHooks {
            onMount: (tc: ReactComponent<Props, State>) => void = onMount
        }

        const di = new Di(new ReactComponentFactory(React))

        const TestComponentEl = di.wrapComponent(TestComponent)

        assert(onMount.notCalled)
        assert(onUpdate.notCalled)
        render(TestComponentEl)
        assert(onMount.calledOnce)
        assert(onUpdate.notCalled)
    })
})
