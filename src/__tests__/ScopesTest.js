// @flow
/* eslint-env mocha */

import {spy, match} from 'sinon'
import assert from 'power-assert'

import {
    source,
    service,
    deps
} from '../annotations'

import Di from '../Di'
import BaseModel from '../BaseModel'

describe('ScopesTest', () => {
    type ModelARec = {
        val?: string;
    }

    it('modify ModelA in parent di', () => {
        class ModelA extends BaseModel<ModelARec> {
            val: string;
            static defaults: ModelARec = {
                val: 'test'
            };
            copy: (rec: ModelARec) => ModelA;
        }
        source({key: 'ModelA'})(ModelA)

        const Service = spy(class {
            val: string;
            constructor(m: ModelA) {
                this.val = m.val
            }
        })
        service(Service)
        deps(ModelA)(Service)

        const di = (new Di()).register([ModelA])
        let newDi = di.create()
        // modify ModelA in parent di
        newDi.val(ModelA).set(new ModelA({val: 'test1'}))
        assert(di.val(ModelA).get().val === 'test1')
    })

    it('model in child scope is independed from parent', () => {
        class ModelA extends BaseModel<ModelARec> {
            val: string;
            static defaults: ModelARec = {
                val: 'test'
            };
            copy: (rec: ModelARec) => ModelA;
        }
        source({key: 'ModelA'})(ModelA)

        const Service = spy(class {
            val: string;
            constructor(m: ModelA) {
                this.val = m.val
            }
        })
        service(Service)
        deps(ModelA)(Service)

        const di = new Di()

        let newDi = di.create().register([ModelA])

        // modify ModelA in parent di
        newDi.val(ModelA).set(new ModelA({val: 'test1'}))

        assert(di.val(ModelA).get().val === 'test')
        assert(newDi.val(ModelA).get().val === 'test1')
    })

    it('model not defined in child scope and in parent', () => {
        class ModelA extends BaseModel<ModelARec> {
            val: string;
            static defaults: ModelARec = {
                val: 'test'
            };
            copy: (rec: ModelARec) => ModelA;
        }
        source({key: 'ModelA'})(ModelA)

        const Service = spy(class {
            val: string;
            constructor(m: ModelA) {
                this.val = m.val
            }
        })
        service(Service)
        deps(ModelA)(Service)

        const di = new Di()
        let newDi = di.create()

        // modify ModelA in parent di
        newDi.val(ModelA).set(new ModelA({val: 'test1'}))

        assert(di.val(ModelA).get().val === 'test')
        assert(newDi.val(ModelA).get().val === 'test1')
    })
})
