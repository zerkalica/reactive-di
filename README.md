# Reactive DI  [![Build Status](https://secure.travis-ci.org/zerkalica/reactive-di.png)](http://travis-ci.org/zerkalica/reactive-di)

[![NPM](https://nodei.co/npm/reactive-di.png?downloads=true&stars=true)](https://nodei.co/npm/reactive-di/)

Typesafe dependency injection container for react-like components.

* With this DI you can buit pure component based architecture.
* With this DI you can forget about [HOC](https://reactjs.org/docs/higher-order-components.html) and any decorators around component.
* Atomatic isolated error and loading status handling for each component.
* ReactiveDI helps you to follow [open/closed principle](https://en.wikipedia.org/wiki/Open/closed_principle) via slots (like [vue slots](https://vuejs.org/v2/guide/components.html#Content-Distribution-with-Slots)).
* [Hierarchical Dependency Injectors](https://angular.io/guide/hierarchical-dependency-injection).
* ReactiveDI easily integrates some state management libraries: [MobX](htttps://mobx.js.org), [lom_atom](https://github.com/zerkalica/lom_atom).
* Framework agnostic, vendor lock-in free: no static dependencies from React, MobX, etc.
* Easily integrates css-in-js solutions like [jss](https://github.com/cssinjs/jss).
* Tiny size about 10kb reactive-di.min.js.

* [example source](https://github.com/zerkalica/rdi-examples), [demo](http://zerkalica.github.io/rdi-examples/)
* [todomvc benchmark](http://mol.js.org/app/bench/#bench=https%3A%2F%2Fzerkalica.github.io%2Futb%2Fbenchmark%2F/sample=preact-lom_atom~preact-mobx~preact-raw~preact-reactive-di)
* [fiddle](https://jsfiddle.net/zerkalica/jxo6hqf8/) example with loading and error handling demo.

<!-- TOC depthFrom:2 depthTo:6 withLinks:1 updateOnSave:1 orderedList:0 -->

- [Install](#install)
- [Debug](#debug)
- [Hello world](#hello-world)
	- [Setup with preact and lom_atom](#setup-with-preact-and-lomatom)
	- [Setup with react and mobx](#setup-with-react-and-mobx)
- [Features](#features)
	- [Typesafe context in components](#typesafe-context-in-components)
	- [State management based on lom_atom or mobx](#state-management-based-on-lomatom-or-mobx)
	- [Automatic error handling](#automatic-error-handling)
	- [Custom error handler](#custom-error-handler)
	- [Loading status handling](#loading-status-handling)
	- [Redefine default dependencies](#redefine-default-dependencies)
	- [Components cloning and slots](#components-cloning-and-slots)
	- [Hierarchical dependency injection](#hierarchical-dependency-injection)
	- [Optional css-in-js support](#optional-css-in-js-support)
	- [Multiple css instances](#multiple-css-instances)
	- [Passing component props to its depenendencies](#passing-component-props-to-its-depenendencies)
	- [React compatible](#react-compatible)
	- [Logging](#logging)
	- [Map config to objects](#map-config-to-objects)
- [Credits](#credits)

<!-- /TOC -->

## Install

```
npm install --save reactive-di lom_atom babel-plugin-transform-metadata
```

Example .babelrc:

```json
{
    "presets": [
      "flow",
      "react",
      ["es2015", {"loose": true}]
    ],
    "plugins": [
        "transform-metadata",
        "transform-decorators-legacy",
        ["transform-react-jsx", {"pragma": "lom_h"}]
    ]
}
```

babel-plugin-transform-metadata is optional, used for metadata generation. ReactiveDI use type annotations for dependency resolving, without this plugin you will need to provide metadata manually.

## Debug

Build rdi and copy to ../app-project/node_modules/reactive-di

```
npm run watch --reactive-di:dest=../app-project
```

## Hello world

ReactiveDI has no static dependencies and not a zero-setup library. Setup is usually about 30-50 SLOC, but you do it once per application. But you can integrate into ReactiveDI any component react-like, state management and css-in-js library via adapters.

### Setup with preact and lom_atom

```js
// @flow
import {detached, mem, action} from 'lom_atom'
import {createReactWrapper, createCreateElement} from 'reactive-di'
import {render, h, Component} from 'preact'

function ErrorableView({error}: {error: Error}) {
    return <div>
        {error instanceof mem.Wait
            ? <div>
                Loading...
            </div>
            : <div>
                <h3>Fatal error !</h3>
                <div>{error.message}</div>
                <pre>
                    {error.stack.toString()}
                </pre>
            </div>
        }
    </div>
}

const lomCreateElement = createCreateElement(
    createReactWrapper(
        Component,
        ErrorableView,
        detached
    ),
    (h: React$CreateElement)
)
global['lom_h'] = lomCreateElement
```

Usage:

```js
import {mem} from 'lom_atom'
import {props} from 'reactive-di'
import {render} from 'preact'

interface IHelloProps {
    name: string;
}

class HelloContext {
    @mem name: string
    @props set props({name}: IHelloProps) {
        this.name = name
    }
}

export function HelloView(
    _: IHelloProps,
    {context}: {context: HelloContext}
) {
    return <div>
        Hello, {context.name}
        <br/><input value={context.name} onInput={({target}) => {
            context.name = (target: any).value
        }} />
    </div>
}
render(<HelloView name="John" />, document.body)
```

### Setup with react and mobx

```js
// @flow
import {Reaction} from 'mobx'
import {createReactWrapper, createCreateElement, createMobxDetached} from 'reactive-di'
import {createElement, Component} from 'react'
import {render} from 'react-dom'

function ErrorableView({error}: {error: Error}) {
    return <div>
        {error instanceof mem.Wait
            ? <div>
                Loading...
            </div>
            : <div>
                <h3>Fatal error !</h3>
                <div>{error.message}</div>
                <pre>
                    {error.stack.toString()}
                </pre>
            </div>
        }
    </div>
}

const lomCreateElement = createCreateElement(
    createReactWrapper(
        Component,
        ErrorableView,
        createMobxDetached(Reaction)
    ),
    createElement
)
global['lom_h'] = lomCreateElement
```

Usage:

```js
import {observable} from 'mobx'
import {props} from 'reactive-di'
import {render} from 'preact'

interface IHelloProps {
    name: string;
}

class HelloContext {
    @observable name: string
    @props set props({name}: IHelloProps) {
        this.name = name
    }
}

export function HelloView(
    _: IHelloProps,
    {context}: {context: HelloContext}
) {
    return <div>
        Hello, {context.name}
        <br/><input value={context.name} onInput={({target}) => {
            context.name = (target: any).value
        }} />
    </div>
}
render(<HelloView name="John" />, document.body)
```

## Features

### Typesafe context in components

You can use [context in stateless functional components](https://reactjs.org/docs/context.html#referencing-context-in-stateless-functional-components). With [babel-plugin-transform-metadata](https://github.com/zerkalica/babel-plugin-transform-metadata) you do not need to provide metadata (like ``` Button.contextTypes = {color: PropTypes.string}; ```).

Context signature generated from second argument:

```js
// @flow
export function HelloView(
    _: IHelloProps,
    {context}: {context: HelloContext}
) { ... }
```

Or

```js
function HelloView(
  _: {},
  context: HelloComponent
) {
  /// ...
}
```

Class definitions used as keys for dependency resolving. For generation dependency metadata ReactiveDI do not use any library (like props-types), raw metadata only expose function arguments to injector. Without plugin, you will need to provide them manually:

```js
HelloView.deps = [{context: HelloContext}]
```

Injector in createElement (lom_h) automatically initializes HelloContext and pass it to HelloView in

```js
render(<HelloView prefix="Hello" />, document.body)
```

### State management based on lom_atom or mobx

ReactiveDI is state management agnostic library. You can use mobx or [lom_atom](https://github.com/zerkalica/lom_atom) (like mobx, but much simpler and with some killer features). In ReactiveDI all components are pure functional.

### Automatic error handling

All errors are isolated in components. They do not breaks whole application. You don't need to manually catch errors via [componentDidCatch](https://reactjs.org/blog/2017/07/26/error-handling-in-react-16.html).

```js
class HelloContext {
    @mem get name() {
      throw new Error('oops')
    }
}

function HelloView(
  _: {},
  {context}: {context: HelloContext}
) {
    return <input value={context.name} onInput={({target}: Event) => {
        context.name = (target: any).value
    }} />
}
```

Exception in ``` get name ``` intercepted by try/catch in HelloView wrapper and displays by default ErrorableView, registered in ReactiveDI setup:

```js
// ...
function ErrorableView({error}: {error: Error}) {
    return <div>
        {error instanceof mem.Wait
            ? <div>
                Loading...
            </div>
            : <div>
                <h3>Fatal error !</h3>
                <div>{error.message}</div>
                <pre>
                    {error.stack.toString()}
                </pre>
            </div>
        }
    </div>
}

const lomCreateElement = createCreateElement(
    createReactWrapper(
        Component,
        ErrorableView,
        detached
    ),
    h
)
global['lom_h'] = lomCreateElement
```

### Custom error handler

You can provide custom error component handler:

```js
function HelloView(
  _: {},
  {context}: {context: HelloContext}
) {
    let name: string
    try {
      name = context.name
    } catch (e) {
      name = 'Error:' + e.message
    }

    return <input value={name} onInput={{target}: Event) => {
        context.name = (target: any).value
    }} />
}
HelloView.onError = ({error: Error}) => (
    <div>{error.message}</div>
)
```

Or manually handle error:

```js
function HelloView(
  _: {},
  {context}: {context: HelloContext}
) {
    let name: string
    try {
      name = context.name
    } catch (e) {
      name = 'Error:' + e.message
    }

    return <input value={name} onInput={{target}: Event) => {
        context.name = (target: any).value
    }} />
}
```

### Loading status handling

In ReactiveDI pending/complete status realized via exceptions. Special user defined "Wait" exception can be handled in ErrorableView.

```js
function ErrorableView({error}: {error: Error}) {
    return <div>
        {error instanceof mem.Wait
            ? <div>
                Loading...
            </div>
            : ...
        }
    </div>
}
```

In component model ``` throw new mem.Wait() ``` catched in HelloComponent wrapper and default ErrorableView shows ``` Loading... ``` instead of HelloView.

```js
class HelloContext {
    @force force: HelloContext

    @mem set name(next: string | Error) {}
    @mem get name(): string {
        // fetch some data and update name
        throw new mem.Wait()
    }
}
```

On fetch complete ``` fetch().then((data: string) => {this.name = data}) ``` sets new data and render HelloView instead of ErrorableView.

### Redefine default dependencies

Class SomeAbstract used somewhere in the application, but at ReactiveDI setup you can redefine them to SomeConcrete class instance with same interface.

```js
class SomeAbstract {}

class SomeConcrete extends SomeAbstract {}

class C {
  a: SomeAbstract
  constructor(a: SomeAbstract) {
    this.a = a
  }
}

const injector = new Injector(
    [
      [SomeAbstract, new SomeConcrete()]
    ]
)

injector.value(SomeAbstract).a instanceof SomeConcrete
```

### Components cloning and slots

In vue you can use [content distribution with slots](https://vuejs.org/v2/guide/components.html#Content-Distribution-with-Slots). ReactiveDI helps you to do same thing in react-applications. Slot is a component itself or its id.

Create slightly modified component, based on FirstCounterView.

```js
import {cloneComponent} from 'reactive-di'
class FirstCounterService {
  @mem value = 0
}

function CounterMessageView({value}: {value: string}) {
  return <div>count: {value}</div>
}

function FirstCounterView(
    _: {},
    counter: FirstCounterService
) {
    return <div>
        <CounterMessageView value={counter.value}/>
        <button id="FirstCounterAddButton" onClick={() => { counter.value++ }}>Add</button>
    </div>
}

class SecondCounterService {
  @mem value = 1
}

// Create FirstCounterView copy, but remove FirstCounterAddButton and replace FirstCounterService to SecondCounterService.

const SecondCounterView = cloneComponent(FirstCounterView, [
    [FirstCounterService, SecondCounterService],
    ['FirstCounterAddButton', null],
], 'SecondCounterView')
```

Works like inheritance in classes, but you don't need to extract each component detail in methods. Any component part is open for extension bу default. Be careful, do not violate [Liskov substitution principle](https://en.wikipedia.org/wiki/Liskov_substitution_principle).

### Hierarchical dependency injection

Each component instance has an own injector. Injector - is a cache map with instances, which types described in component context. Looks like angular [hierarchical dependency injection](https://angular.io/guide/hierarchical-dependency-injection), but no so complex.

When Parent and Child components depends on on same SharedService - DI injects one instance to them. And this instance live while Parent component mounted to DOM.

```js
class SharedService {}
function Parent(
  props: {},
  context: {sharedService: SharedService}
) {
  return <Child parentService={context.sharedService} />
}

function Child(
  _: {},
  context: {sharedService: SharedService}
) {
  // context.sharedService instance cached in parent
}
```

If only Child component depends on SharedService, DI creates separated SharedService instance per Child.

```js
class SharedService {}
function Parent() {
  return <Child/>
}

function Child(
  props: {},
  context: {sharedService: SharedService}
) {
  // sharedService - cached in child
}
```

### Optional css-in-js support

Css-in-js with reactivity and dependency injection power. ReactiveDI not statically depended on [Jss](https://github.com/cssinjs/jss), you can integrate another css-in-js solution, realizing described below interface.

Setup:

```js
// @flow
import {detached, mem} from 'lom_atom'
import {createReactWrapper, createCreateElement, Injector} from 'reactive-di'

import {h, Component} from 'preact'
import {create as createJss} from 'jss'

import ErrorableView from './ErrorableView'

const jss = createJss()
/*
jss must implements IProcessor interface:

export interface IProcessor {
    createStyleSheet<V: Object>(_cssObj: V, options: any): ISheet<V>;
}

export interface ISheet<V: Object> {
    attach(): ISheet<V>;
    classes: {+[id: $Keys<V>]: string};
}
*/
const lomCreateElement = createCreateElement(
    createReactWrapper(
        Component,
        ErrorableView,
        detached,
        new Injector([], jss)
    ),
    h
)
global['lom_h'] = lomCreateElement
```

Reactive style usage:

```js
import {mem} from 'lom_atom'
import {theme} from 'reactive-di'

class ThemeVars {
  @mem color = 'red'
}

class MyTheme {
    vars: ThemeVars
    constructor(vars: ThemeVars) {
        this._vars = vars
    }

    @mem @theme get css() {
        return {
            wrapper: {
                backgroundColor: this._vars.color
            }
        }
    }
}

function MyView(
  props: {},
  {theme: {css}, vars}: {theme: MyTheme, vars: ThemeVars}
) {
  return <div class={css.wrapper}>...
    <button onClick={() => vars.color = 'green'}>Change color</button>
  </div>
}
```

Whith lom_atom, styles automatically mounts/unmounts together with component. Changing ``` vars.color ``` automatically rebuilds and remounts css.

With mobx, unmount feature does not works at current moment. But still no memory leaks, due to unique theme id.

Without any state management library works only css mounting without reactivity updates.

```js
import {theme} from 'reactive-di'
class MyTheme {
    @theme get css() {
        return {
            wrapper: {
                backgroundColor: 'red'
            }
        }
    }
}

function MyView(
  props: {},
  {theme: {css}, vars}: {theme: MyTheme}
) {
  return <div class={css.wrapper}>...</div>
}
```

### Multiple css instances

By default one css block generated per component function. But you can generate unique css block per component instance too. Just use ``` theme.self ``` decorator:

```js
import {mem} from 'lom_atom'
import {props, theme} from 'reactive-di'

interface MyProps {
    color: string;
}

class MyTheme {
    @mem @props _props: MyProps
    @mem @theme.self get css() {
        return {
            wrapper: {
                backgroundColor: this.props.color
            }
        }
    }
}

function MyView(
  props: MyProps,
  {theme: {css}}: {theme: MyTheme}
) {
  return <div class={css.wrapper}>...
  </div>
}

<MyView color="red"/>
<MyView color="blue"/>
```

### Passing component props to its depenendencies

You can pass component properties to its dependencies via ``` prop ``` decorator.

```js
import {mem} from 'lom_atom'
import {props} from 'reactive-di'

interface MyProps {
  some: string;
}

class MyViewService {
  @props _props: MyProps;
  // @mem @props _props: MyProps; // for reactive props
  @mem get some(): string {
    return this._props.some + '-suffix'
  }
}

function MyView(
  props: MyProps,
  {service}: {service: MyViewService}
) {
  return <div>{service.some}</div>
}
```

If you need to react on props changes - just use combination ``` @mem ``` and ``` @props ``` decorators.

```js
class MyViewService {
  @mem @props _props: MyProps;
  // @mem @props _props: MyProps; // for reactive props
  @mem get some(): string {
    return this._props.some + '-suffix'
  }
}
```

### React compatible

You can use any react/preact/inferno components together with rdi components.

### Logging

Not ReactiveDi part, in state management libraries you can monitor state changes and user actions.

Console logger in lom_atom:

```js
import {defaultContext, BaseLogger, ConsoleLogger} from 'lom_atom'
import type {ILogger} from 'lom_atom'

defaultContext.setLogger(new ConsoleLogger())
```

For custom loggers, implement [interface ILogger](https://github.com/zerkalica/lom_atom/blob/master/src/interfaces.js#L9).

### Map config to objects

Experimental feature - you can restore state on client side by providing data to class map in Injector.

```js
// @flow
import {mem} from 'lom_atom'
import {Injector} from 'reactive-di'

const defaultDeps = []
const injector = new Injector([], undefined, {
    SomeService: {
        name: 'test',
        id: 123
    }
})

class SomeService {
    // setup babel-plugin-transform-metadata or define displayName, if js-uglify used
    static displayName = 'SomeService'
    @mem name = ''
    id = 0
}

const someService: SomeService = injector.value(SomeService)

someService.name === 'test'
someService.id === 123
```

displayName in class used as a key for data mapping. [babel-plugin-transform-metadata](https://github.com/zerkalica/babel-plugin-transform-metadata) can generate displayName. To enable it, add ``` ["transform-metadata", {"addDisplayName": true}] ``` into .babelrc.

Example .babelrc:

```json
{
    "presets": [
      "flow",
      "react",
      ["es2015", {"loose": true}]
    ],
    "plugins": [
        ["transform-metadata", {"addDisplayName": true}],
        "transform-decorators-legacy",
        ["transform-react-jsx", {"pragma": "lom_h"}]
    ]
}
```

## Credits
* [mol](https://github.com/eigenmethod/mol) OORP ideas
* [Ninject](https://github.com/ninject/Ninject) best dependency injector, writen in C#.
* [inversify.io](http://inversify.io/) nice try of reimplementing Ninject in typescript.
* [angular2](https://angular.io) ideas of hierarchical injectors.
* [babel-plugin-angular2-annotations](https://github.com/shuhei/babel-plugin-angular2-annotations) ideas of metadata for resolving dependencies.
