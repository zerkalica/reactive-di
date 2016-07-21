// @flow
/* eslint-env mocha */

import {spy, match} from 'sinon'
import assert from 'power-assert'

import {
    factory,
    service,
    deps,
    source
} from '../annotations'
import type {InitData} from '../interfaces/deps'

import Di from '../Di'
import BaseModel from '../BaseModel'

describe('InitializerTest', () => {
    type ModelARec = {
        val?: string;
    }

    class Dep {
        val: string = 'test';
    }

    it('catch sync model changes in service throught facet', () => {
        class ModelA extends BaseModel<ModelARec> {
            val: string;
            static defaults: ModelARec = {
                val: '1'
            };
            copy: (rec: ModelARec) => ModelA;
        }

        function initA(dep: Dep): InitData<ModelA> {
            return [
                new ModelA({val: dep.val})
            ]
        }
        deps(Dep)(initA)
        factory(initA)

        source({key: 'ModelA', init: initA})(ModelA)

        const Service = spy(class {
            val: string;
            constructor(m: ModelA) {
                this.val = m.val
            }
        })
        service(Service)
        deps(ModelA)(Service)

        const di = new Di()
        const s: Service = di.val(Service).get()
        assert(s.val === 'test')
    })

    it('catch async model changes in service throught facet', () => {
        class ModelA extends BaseModel<ModelARec> {
            val: string;
            static defaults: ModelARec = {
                val: '1'
            };
            copy: (rec: ModelARec) => ModelA;
        }

        const pmodelA = Promise.resolve(new ModelA({val: 'from promise'}))

        function initA(dep: Dep): InitData<ModelA> {
            return [
                new ModelA({val: dep.val}),
                pmodelA
            ]
        }
        deps(Dep)(initA)
        factory(initA)

        source({key: 'ModelA', init: initA})(ModelA)

        const Service = spy(class {
            val: string;
            constructor(m: ModelA) {
                this.val = m.val
            }
        })
        service(Service)
        deps(ModelA)(Service)

        const di = new Di()
        const s: Service = di.val(Service).get()
        assert(s.val === 'test')
        return pmodelA
            .then(() => {
                assert(s.val === 'from promise')
            })
    })
})
