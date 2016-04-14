/* @flow */

import type {
    Container,
    ContainerManager,
    CreateContainerManager
} from 'reactive-di/i/coreInterfaces'

import {
    createManagerFactory,
    defaultPlugins,
    createDummyRelationUpdater
} from 'reactive-di/index'
import assert from 'power-assert'
import {alias, value} from 'reactive-di/configurations'
import {klass, factory} from 'reactive-di/annotations'

class Tire {
    diameter: number;
    width: number;

    constructor(width: number, diameter: number) {
        this.width = width
        this.diameter = diameter
    }
}

class AbstractEngine {}

class ConcreteEngine extends AbstractEngine {
}
klass()(ConcreteEngine)

class Car {
    engine: AbstractEngine;
    constructor(engine: AbstractEngine) {
        this.engine = engine
    }
}
klass(AbstractEngine)(Car)

class Bus {
    engine: AbstractEngine;
    constructor({engine}: {engine: AbstractEngine}) {
        this.engine = engine
    }
}
klass({engine: AbstractEngine})(Bus)

function DefaultWidth() {}

function createTire(defaultWidth: number, diameter: number): Tire {
    return new Tire(defaultWidth, diameter)
}
factory(DefaultWidth)(createTire)

const createContainerManager: CreateContainerManager
    = createManagerFactory(defaultPlugins, createDummyRelationUpdater);

const cm: ContainerManager = createContainerManager([
    value(DefaultWidth, 22),
    alias(AbstractEngine, ConcreteEngine)
]);

const di: Container = cm.createContainer();

assert(di.get(Car) instanceof Car)
assert(di.get(Bus) instanceof Bus)
assert(di.get(Car).engine instanceof ConcreteEngine)

const createTireWithDiameter: (diameter: number) => Tire = di.get(createTire);

const tire: Tire = createTireWithDiameter(15);

assert(tire instanceof Tire)
assert(tire.width === 22)
assert(tire.diameter === 15)
