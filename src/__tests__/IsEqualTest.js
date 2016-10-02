// @flow
/* eslint-env mocha */

import {spy, match} from 'sinon'
import assert from 'power-assert'
import {atom} from 'derivable'
import {
    service,
    deps,
    source,
    factory,
    hooks
} from 'reactive-di/annotations'

import Di from 'reactive-di/core/Di'
import BaseModel from 'reactive-di/utils/BaseModel'

describe('IsEqualTest', () => {
    type ModelARec = {
        val?: string;
    }

    class ModelA extends BaseModel<ModelARec> {
        val: string;
        static defaults: ModelARec = {
            val: '1'
        };
        copy: (rec: ModelARec) => ModelA;
    }
    source({key: 'ModelA'})(ModelA)

    it('do not call react, if objects are deep equals', () => {
        class Facet {
            val: string
            constructor(m: ModelA) {
                this.val = m.val
            }
        }
        deps(ModelA)(Facet)

        class FacetHooks {
            isEqual(old: Facet, newVal: Facet): boolean {
                return old.val === newVal.val
            }
        }
        hooks(Facet)(FacetHooks)

        const di = new Di()
        const onReact = spy()
        di.val(Facet).react(onReact)
        const ma =  di.val(ModelA)
        ma.set(new ModelA({val: '123'}))
        ma.set(new ModelA({val: '123'}))
        ma.set(new ModelA({val: '123'}))
        assert(onReact.calledTwice)
    })
})
