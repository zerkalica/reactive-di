// @flow
/* eslint-env mocha */

import {spy, match} from 'sinon'
import assert from 'power-assert'

import {
    service,
    deps,
    klass,
    source,
    factory
} from '../annotations'
import type {
    ArgDep,
    Dep
} from '../annotations'

import Di from '../Di'
import BaseModel from '../BaseModel'

type Atom = {
    set: any
}

const FN: (a: string) => void = ((() => {}): any);
// type FN = typeof FN
function createFn(): typeof FN {
    return (a: string) => {

    }
}
createFn()('1')

describe('Di.Base - class with one dependency', () => {
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

    it('create service from class', () => {
        const Service = spy(class {
            _modelA: ModelA;

            constructor(modelA: ModelA) {
                this._modelA = modelA
            }

            getValue() {
                return this._modelA.val
            }
        })
        service(Service)
        klass(Service)
        deps(ModelA)(Service)

        const di = new Di()
        const s: Service = di.val(Service).get()
        const modelA: ModelA = di.val(ModelA).get()
        assert(Service.calledOnce)
        assert(Service.firstCall.calledWith(
            match.instanceOf(ModelA)
                .and(match.same(modelA))
        ))
    })

    it('dependency changed and class constructor invoked inside with new deps', () => {
        const Service = spy(class {
            _modelA: ModelA;
            constructor(modelA: ModelA) {
                this._modelA = modelA
            }
            getValue() {
                return this._modelA.val
            }
        })
        service(Service)
        klass(Service)
        deps(ModelA)(Service)

        const di = new Di()
        const s: Service = di.val(Service).get()
        const modelA = di.val(ModelA)
        assert(s.getValue() === '1')
        modelA.set(modelA.get().copy({val: '123'}))
        assert(s.getValue() === '123')

        const newService: Service = di.val(Service).get()
        assert(newService === s)
    })

    it('create service from factory', () => {
        const FactoryService = spy(function (modelA: ModelA) {
            return () => modelA.val
        })
        service(FactoryService)
        factory(FactoryService)
        deps(ModelA)(FactoryService)

        const di = new Di()
        const fn = di.val(FactoryService).get()
        const modelA: ModelA = di.val(ModelA).get()
        assert(FactoryService.calledOnce)
        assert(FactoryService.firstCall.calledWith(
            match.instanceOf(ModelA)
                .and(match.same(modelA))
        ))
    })

    it('dependency changed and factory changed inside', () => {
        const FactoryService = spy(function factoryService(modelA: ModelA): () => string {
            return () => modelA.val
        })
        service(FactoryService)
        factory(FactoryService)
        deps(ModelA)(FactoryService)

        const di = new Di()
        const fn: FactoryService = di.val(FactoryService).get()
        const modelA = di.val(ModelA)
        assert(fn() === '1')
        modelA.set(modelA.get().copy({val: '123'}))

        const newFn = di.val(FactoryService).get()
        assert(newFn === fn)

        assert(fn() === '123')
    })
})
