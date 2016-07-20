// @flow
/* eslint-env mocha */

import {spy, match} from 'sinon'
import assert from 'power-assert'

import {
    RdiMeta,
    service,
    deps,
    source,
    klass,
    factory
} from '../annotations'
import type {
    ArgDep,
} from '../interfaces'

import Di from '../Di'
import BaseModel from '../BaseModel'

describe('DerivableTest', () => {
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
    klass(ModelA)
    source({key: 'ModelA'})(ModelA)

    class Facet {
        val: string;
        constructor(m: ModelA) {
            this.val = m.val
        }
    }
    deps(ModelA)(Facet)
    klass(Facet)

    it('catch model changes in service throught facet', () => {
        const Service = spy(class {
            val: string;
            constructor(facet: Facet) {
                this.val = facet.val
            }
        })
        service(Service)
        klass(Service)
        deps(Facet)(Service)

        const di = new Di()
        const s: Service = di.val(Service).get()
        assert(s.val === '1')
        di.atom(ModelA).set(new ModelA({val: '123'}))
        assert(s.val === '123')
        assert(s === di.val(Service).get())
    })
})
