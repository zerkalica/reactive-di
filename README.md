# reactive-di

Extensible hierarchical [dependency injection](https://en.wikipedia.org/wiki/Dependency_injection) container with [flowtype](http://flowtype.org/) interface support using [Babel 6+](https://babeljs.io/).

Features:
-	Supports [hierarchical DI](https://angular.io/docs/ts/latest/guide/hierarchical-dependency-injection.html) like in angular2
-	Support middleware interceptors
-	Can be configured from annotations or configration data
-	Suitable for both node and the browser
-	Works in IE9+ without Map/Set polyfills
-	Can resolve dependencies both from [flowtype](http://flowtype.org/) interfaces and types via [babel metadata plugin](https://github.com/zerkalica/babel-plugin-transform-metadata) and from classes.
-	Extensible api allow to create complex data plugins like [reactive-di-observable](https://github.com/zerkalica/reactive-di-observable)
-	[React](https://facebook.github.io/react/) support via [reactive-di-react](https://github.com/zerkalica/reactive-di-react) plugin
-	Has complex example [reactive-di-todomvc](https://github.com/zerkalica/reactive-di-todomvc/) application.

## Example

```js
// interfaces.js
// @flow
export interface Engine {}
export interface Brakes {}
export interface Car {
    engine: IEngine;
}
```

```js
// classes.js
// @flow
import type {
    IEngine,
    IBrakes
} from './interfaces'

import {klass} from 'reactive-di/annotations'

export class Engine {}
export class Brakes {}
export class Car {
    engine: IEngine;
    // Metadata generated in babel-plugin-transform-metadata
    constructor(engine: IEngine, brakes: IBrakes) {
        this.engine = engine
    }
}
export class SomeClass {
    constructor()
}

@klass()
export class SomeDecoratedClass {}
```

```js
// main.js
// @flow

import type {
    ConfigItem,
    CreateContainerManager,
    ContainerManager,
    Container
} from 'reactive-di'

import {
    defaultPlugins,
    createManagerFactory
} from 'reactive-di'
import {klass} from 'reactive-di/configurations'
import _ from 'babel-plugin-transform-metadata/_'

import {
    Engine,
    Car,
    Brakes,
    SomeClass,
    SomeDecoratedClass
} from './classes'

import type {
    ICar,
    IEngine,
    ICar
} from './interfaces'

const configuration: Array<ConfigItem> = [
    // using interfaces:
    [(_: IEngine), klass(Engine)],
    [(_: IBrakes), klass(Brakes)],
    [(_: ICar), klass(Car)],
    // using class itself
    klass(SomeClass),
    // using tagget class
    SomeDecoratedClass
];

// Register plugins
const createContainerManager: CreateContainerManager = createManagerFactory(defaultPlugins);

// Register configuration
const containerManager: ContainerManager = createContainerManager(configuration);

// Create container with new state
const container: Container = containerManager.createContainer();

// Get dependency by interface
const car: ICar = container.get((_: ICar));

// Get dependency by class
const someClass: SomeClass = container.get(SomeClass)
```

## Configuration helpers

Each dependency will be registered in react-di from annotation or configuration helper. Each annotation has equivalent configuration helper.

### klass

Register dependency as class.

Configuration:

```js
// @flow
import type {ConfigItem} from 'reactive-di'
import {klass} from 'reactive-di/configurations'

class Engine {}
class Brakes {}
class Car {
    engine: Engine;
    constructor(engine: Engine) {
        this.engine = engine
    }
}

const configuration: Array<ConfigItem> = [
    klass(Engine),
    klass(Brakes),
    klass(Car)
];
```

Annotation:

```js
// @flow
import {klass} from 'reactive-di/annotations'

@klass()
class Engine {}

@klass()
class Brakes {}

@klass()
class Car {
    engine: Engine;
    brakes: Brakes;
    // Auto resolve dependencies in option object
    constructor(options: {
        engine: Engine,
        brakes: Brakes
    }) {
        this.engine = options.engine
        this.brakes = options.brakes
    }
}
```

### factory

Factory function with deps.

Configuration:

```js
// @flow
import type {ConfigItem} from 'reactive-di'
import {klass, factory} from 'reactive-di/configurations'

class Car {}
class Engine {}

function CarFactory(engine: Engine): Car {
    return new Car(engine)
}

const configuration: Array<ConfigItem> = [
    klass(Engine),
    factory(CarFactory)
];
```

Annotation:

```js
// @flow
import type {ConfigItem} from 'reactive-di'
import {klass, factory} from 'reactive-di/annotations'

class Car {}

@klass()
class Engine {}

function CarFactory(engine: Engine): Car {
    return new Car(engine)
}
factory(CarFactory)
```

### compose

Compose like factory, by deps mixed with regular arguments in ony function.

Configuration:

```js
// @flow
import type {ConfigItem} from 'reactive-di'
import {createManagerFactory} from 'reactive-di'
import {klass, compose} from 'reactive-di/configurations'

class Car {}
class Engine {}

function CarFactory(engine: Engine, /* @args*/ power: number): Car {
    return new Car(engine, power)
}

const configuration: Array<ConfigItem> = [
    klass(Engine),
    compose(CarFactory)
];
const container = createManagerFactory()(configuration).createContainer()
const createCar: (power: number) => Car = container.get(CarFactory);
const car: Car = createCar(33);
```

Annotation:

```js
// @flow
import type {ConfigItem} from 'reactive-di'
import {createManagerFactory} from 'reactive-di'
import {klass, compose} from 'reactive-di/annotations'

class Car {}

@klass()
class Engine {}

function CarFactory(engine: Engine, /* @args*/ power: number): Car {
    return new Car(engine, power)
}
compose()(CarFactory)

const container = createManagerFactory()().createContainer()
const createCar: (power: number) => Car = container.get(CarFactory);
const car: Car = createCar(33);
```

### alias

Link to another dependency.

Configuration:

```js
// @flow
import type {ConfigItem} from 'reactive-di'
import {createManagerFactory} from 'reactive-di'
import {klass, alias} from 'reactive-di/configurations'

class AbstractCar {
    color: string;
}

class RedCar {
    color: string = 'red';
}

const configuration: Array<ConfigItem> = [
    klass(Car),
    alias(AbstractCar, RedCar)
];
```

Annotation:

Doesn't matter link AbstractCar to RedCar in AbstractCar module.

### value

Value helper.

Configuration:


```js
// @flow
import type {ConfigItem} from 'reactive-di'
import {createManagerFactory} from 'reactive-di'
import {klass, value} from 'reactive-di/configurations'

function CarColor() {}

class Car {
    color: string = 'red';
}

const configuration: Array<ConfigItem> = [
    klass(Car, CarColor),
    value(CarColor, 'red')
];
const container = createManagerFactory()(configuration).createContainer()
container.get(Car).color === 'red'
```

### tag

Help to mark any dependecy by tags.

Configuration:

```js
// @flow
import type {ConfigItem} from 'reactive-di'
import {tag, klass} from 'reactive-di/configurations'

class RedCar {}

const configuration: Array<ConfigItem> = [
    tag(klass(RedCar), 'machine', 'car')
];
```

Annotation:

```js
// @flow
import type {ConfigItem} from 'reactive-di'
import {tag, klass} from 'reactive-di/annotations'

@tag('machine', 'car')
@klass()
class RedCar {
}
```

## Middlewares

Can be attached to function, klass or tag. Works as interceptors after executing function or method.

For functions by tag:

```js
function myFn(b: number, c: number): number {
    return b + c
}
function myFnMiddleware(result: number, b: number, c: number): void {
    console.log(result, b, c)
}

const newDi: Container = cm.createContainer([
    tag(compose(myFn, MyValue), 'mytag'),
    compose(myFnMiddleware)
], [
    [myFnMiddleware, ['mytag']]
])

const result = newDi.get(myFn)
result(1, 2)
// console: 3, 1, 2
```

For classes

```js
class MyClass {
    test(a: number): number {
        return a + 1
    }

    test2(a: number): number {
        return a
    }
}

class MyClassMiddleware {
    test(result: number, a: number): void {
        console.log(result, a)
    }
}

const newDi: Container = createContainer([
    klass(MyClass),
    klass(MyClassMiddleware)
], [
    [MyClassMiddleware, [MyClass]]
])

const my = newDi.get(MyClass)

assert(my instanceof MyClass) // true
my.test(1) // console: 2, 1
my.test2(1) // no console output
```

## Comparing with angular2 di

### Registering dependencies

Angular2:

```typescript
import {provide} from 'angular2/core';

const injector = Injector.resolveAndCreate([
    Car,
    provide(Engine, {useClass: Engine}),
    provide(String, {useValue: 'Hello World'}),
    provide(V8, {useExisting: Engine}),
    provide(Factory, {
        useFactory: (car, engine) => IS_V8 ? new V8Engine() : V6Engine(),
        deps: [Car, Engine]
    })
]);

injector.get(Car)
```

Reactive-di:

```js
// @flow
import { alias, klass, factory} from 'reactive-di/configurations'

const createContainerManager = createManagerFactory();
const cm = createContainerManager([
    klass(Car),
    klass(Engine),
    value(String, 'Hello World'),
    alias(V8, Engine),
    {
        kind: 'factory',
        target: (car, engine) => IS_V8 ? new V8Engine() : V6Engine(),
        deps: [Car, Engine]
    }
])
const di = cm.createContainer();

di.get(Car)
```

### Hierarchical Dependency Injection

Angular2 [hierarchical dependency injection](https://angular.io/docs/ts/latest/guide/hierarchical-dependency-injection.html):

```typescript
var injector = Injector.resolveAndCreate([Engine, Car]);
var childInjector = injector.resolveAndCreateChild([Engine]);

injector.get(Engine) !== childInjector.get(Engine);
injector.get(Car) === childInjector.get(Car) // Car from first injector
```

Reactive-di:

```js
// @flow
import {alias, klass, factory} from 'reactive-di/configurations'

const createContainerManager = createManagerFactory();
const cm = createContainerManager([
    klass(Car),
    klass(Engine)
])
const childCm = createContainerManager([
    klass(Engine)
])

const di = cm.createContainer();
const childDi = childCm.createContainer(di)

di.get(Engine) !== childDi.get(Engine);
di.get(Car) === childDi.get(Car)
```

### Creating container from preconfigured dependencies

Angular2:

```typescript
@Injectable()
class Engine {
}
@Injectable()
class Car {
  constructor(public engine:Engine) {}
}
var providers = Injector.resolve([Car, Engine]);
var injector = Injector.fromResolvedProviders(providers);
injector.get(Car) instanceof Car
```

Reactive-di:

```js
// @flow
import {klass} from 'reactive-di/configurations'

class Engine {}

class Car {
  constructor(engine: Engine) {}
}

const createContainerManager = createManagerFactory();
const providers = createContainerManager([
    klass(Car),
    klass(Engine)
])

const di = providers.createContainer();
di.get(Car) intanceof Car
```

### Opaque token

Angular2 use [opaque token](https://angular.io/docs/js/latest/api/core/OpaqueToken-class.html) for non-class dependencies.

```typescript
var t = new OpaqueToken('value');
var injector = Injector.resolveAndCreate([
  provide(t, {useValue: 'bindingValue'})
]);
injector.get(t) === 'bindingValue'
```

Reactive-di use interfaces itself:

```js
// @flow
// interfaces.js
export type IValue = string
```

```js
// @flow
// main.js
import type {IValue} from './interfaces'
import _ from 'babel-plugin-transform-metadata'

const createContainerManager = createManagerFactory();
const providers = createContainerManager([
    value((_: IValue), 'some value')
])
const di = providers.createContainer();
di.get((_: IValue)) === 'some value'
```

## Credits

* [Ninject](https://github.com/ninject/Ninject) best dependency injector, writen in C#.
* [inversify.io](http://inversify.io/) nice try of reimplementing Ninject in typescript.
* [angular2](https://angular.io) ideas of hierarchical injectors.
* [mobx](http://mobxjs.github.io/mobx/) ideas of unobtrusive reactive state.
* [redux](https://github.com/reactjs/redux) ideas of state modification in reducer.
* [babel-plugin-angular2-annotations](https://github.com/shuhei/babel-plugin-angular2-annotations) ideas of metadata for resolving dependencies.
* [babel-plugin-type-metadata](https://github.com/stephanos/babel-plugin-type-metadata) ideas of generating metadata for flowtypes.
