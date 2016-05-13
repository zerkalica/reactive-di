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

export class Engine {}
export class Brakes {}
export class Car {
    engine: IEngine;
    constructor(engine: IEngine, brakes: IBrakes) {
        this.engine = engine
    }
}
export class SomeClass {}
```

```js
// main.js
// @flow
import type {ConfigItem} from 'reactive-di'
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
    SomeClass
} from './classes'

import type {
    ICar,
    IEngine,
    ICar
} from './interfaces'

const configuration: Array<ConfigItem> = [
    [(_: IEngine), klass(Engine)],
    [(_: IBrakes), klass(Brakes)],
    [(_: ICar), klass(Car)],
    klass(SomeClass)
];

const container = createManagerFactory(defaultPlugins)(configuration).createContainer()
const car: ICar = container.get((_: ICar));

container.get(SomeClass)
```
