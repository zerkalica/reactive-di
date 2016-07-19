// @flow
/* eslint-env mocha */

import {spy, match} from 'sinon'
import assert from 'power-assert'

import {
    RdiMeta,
    paramTypesKey,
    metaKey,
    factory,
    key,
    derivable,
    deps,
    init,
    klass
} from '../annotations'
import type {
    InitData
} from '../annotations'

import Di from '../Di'
import BaseModel from '../BaseModel'

import {atom} from 'derivable'

describe('InitialValueTest', () => {
    type ModelARec = {
        val?: string;
    }

    it('init constant value as is', () => {
        class ModelA extends BaseModel<ModelARec> {
            val: string;
            static defaults: ModelARec = {
                val: 'test'
            };
            copy: (rec: ModelARec) => ModelA;
        }
        key('modelA')(ModelA)
        klass(ModelA)

        const Service = spy(class {
            val: string;
            constructor(m: ModelA) {
                this.val = m.val
            }
        })
        klass(Service)
        deps([ModelA])(Service)

        const di = (new Di()).values({
            modelA: {
                val: 'outside'
            }
        })
        const m = di.val(ModelA).get()
        assert(!(m instanceof ModelA))
        assert(m.val === 'outside')
    })

    it('init constant value and pass to model constructor', () => {
        class ModelA extends BaseModel<ModelARec> {
            val: string;
            static defaults: ModelARec = {
                val: 'test'
            };
            copy: (rec: ModelARec) => ModelA;
        }
        key('modelA', true)(ModelA)
        klass(ModelA)

        const Service = spy(class {
            val: string;
            constructor(m: ModelA) {
                this.val = m.val
            }
        })
        klass(Service)
        deps([ModelA])(Service)

        const di = (new Di()).values({
            modelA: {
                val: 'outside'
            }
        })
        const m = di.val(ModelA).get()
        assert(m instanceof ModelA)
        assert(m.val === 'outside')
    })

    it('init atom value', () => {
        class ModelA extends BaseModel<ModelARec> {
            val: string;
            static defaults: ModelARec = {
                val: 'test'
            };
            copy: (rec: ModelARec) => ModelA;
        }
        key('modelA', true)(ModelA)
        klass(ModelA)

        const Service = spy(class {
            val: string;
            constructor(m: ModelA) {
                this.val = m.val
            }
        })
        klass(Service)
        deps([ModelA])(Service)

        const am = atom({
            val: 'outside'
        })

        const di = (new Di()).values({
            modelA: am
        })

        assert(di.val(ModelA).get().val === 'outside')
        am.set({val: 'outside2'})
        assert(di.val(ModelA).get().val === 'outside2')
    })
})
