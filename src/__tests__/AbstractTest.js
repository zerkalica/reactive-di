// @flow
/* eslint-env mocha */

import {spy, match} from 'sinon'
import assert from 'power-assert'

import {
    service,
    abstract,
    deps,
    source,
    factory
} from 'reactive-di/annotations'

import Di from 'reactive-di/Di'
import BaseModel from 'reactive-di/utils/BaseModel'

describe('AbstractTest', () => {
    class ModelA extends BaseModel<$Shape<ModelA>> {
        val: string
        static defaults: $Shape<ModelA> = {
            val: '1'
        }
        copy: (rec: $Shape<ModelA>) => ModelA
    }
    abstract(ModelA)

    it('can\'t inject abstract model', () => {
        class Service {
            b: ModelA
            constructor(b: ModelA) {
                this.b = b
            }
        }
        deps(ModelA)(Service)
        const di = new Di()
        assert.throws(() => {
            const model: ModelA = di.val(Service).get().b
        }, /Need register Abstract entity/)
    })

    it('redefine model', () => {
        class ModelB extends ModelA {
            static defaults: $Shape<ModelA> = {
                val: '2'
            }
        }
        source({key: 'ModelB'})(ModelB)

        class Service {
            b: ModelB
            constructor(b: ModelB) {
                this.b = b
            }
        }
        deps(ModelB)(Service)

        const di = new Di()
        const model: ModelB = di.val(Service).get().b
        assert(model.val === '2')
        assert(model instanceof ModelB)
    })
})
