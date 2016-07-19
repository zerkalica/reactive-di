// @flow
/* eslint-env mocha */

import {spy, match} from 'sinon'
import assert from 'power-assert'

import {
    RdiMeta,
    paramTypesKey,
    metaKey,
    factory,
    component,
    derivable,
    deps,
    init,
    klass
} from '../annotations'
import type {
    InitData
} from '../annotations'

import type {
    Derivable
} from '../adapters/Adapter'

import Di from '../Di'
import BaseModel from '../BaseModel'
import ComponentState from '../ComponentState'

describe('ComponentTest', () => {
    type ModelARec = {
        val?: string;
    }

    it('component mount', () => {
        class ModelA extends BaseModel<ModelARec> {
            val: string;
            static defaults: ModelARec = {
                val: '1'
            };
            copy: (rec: ModelARec) => ModelA;
        }
        klass(ModelA)

        const Component = spy(class {
        })
        component()(Component)
        klass(Component)

        function createComponent<State>(state: ComponentState<State>) {
            return class WrappedComponent extends state.target {
                _deps: Derivable<[State]>;
                constructor(props: any) {
                    super()
                    this._deps = state.deps
                    this.state = this._deps.get()[0]
                }

                setState(state: State): void {
                    this.state = state
                }

                componentDidMount() {
                    this._deps.react(([state]) => {
                        this.setState(state)
                    })
                }

                componentWillUnmount() {
                }
            }
        }

        const di = new Di(createComponent)
        const c = di.val(Component).get()
    })
})
