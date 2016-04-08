/* @flow */
/* eslint-disable no-console */

import {
    ReactiveDi,
    defaultPlugins,
    createDummyRelationUpdater
} from 'reactive-di/index'

import {
    alias,
    factory,
    facet,
    klass,
    value,
    middleware
} from 'reactive-di/providers'

import {
    klass as klassAnn
} from 'reactive-di/annotations'

class ModelA {
    v: number = 1;
}

class ModelB {
    v: number = 2;
}

class AbstractService {
    config: string;
    text: string;
}

function facet1(deps: {
    a: {
        v: number
    },
    b: {
        v: number
    }
}): number {
    return deps.a.v + deps.b.v
}

function summFactory(
    a: {
        v: number
    },
    b: number
): number {
    return a.v + b
}

class SomeService {
    _calc: (v: number) => number;
    _value: number;
    _service: AbstractService;

    constructor(
        val: number,
        calc: (v: number) => number,
        service: AbstractService
    ) {
        this._value = val
        this._calc = calc
        this._service = service
    }

    getString(): string {
        return this._service.text
    }

    summ(v: number): number {
        return this._calc(this._value, v)
    }
}
klassAnn(ModelB, summFactory, AbstractService)(SomeService)

function ConfigA() {}

class ConcreteService {
    config: string;
    text: string = 'hello from ConcreteService';

    constructor(config: string) {
        this.config = config
    }
}

class MyMiddleware {
    getString(result: string): void {
        console.log(`SomeService#getString() returns ${result}`)
    }

    summ(result: number, v: number): void {
        console.log(`SomeService#summ(${v}) returns ${result}`)
    }
}

function facet1Middleware(result: number, deps: {
    a: {
        v: number
    },
    b: {
        v: number
    }
}): void {
    console.log(`facet1(${JSON.stringify(deps, null, '  ')}) returns ${result}`)
}

const di = new ReactiveDi(defaultPlugins, createDummyRelationUpdater)

const newDi = di
    .create([
        facet(facet1, {a: ModelA, b: ModelB}),
        factory(summFactory, {a: ModelA}),
        factory(facet1Middleware),
        middleware(facet1Middleware, facet1)
    ])
    .create([
        value(ConfigA, 'test config'),
        klass(ConcreteService, ConfigA),
        alias(AbstractService, ConcreteService),
        value(ModelA, new ModelA()),
        value(ModelB, new ModelB()),
        klass(MyMiddleware),
        middleware(MyMiddleware, SomeService)
    ])

const srv: SomeService = newDi.get(SomeService);
console.log(srv.getString())
console.log(srv.summ(1))
console.log(newDi.get(facet1))
console.log(newDi.get(AbstractService) instanceof ConcreteService)
