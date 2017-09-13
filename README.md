# Reactive DI  [![Build Status](https://secure.travis-ci.org/zerkalica/reactive-di.png)](http://travis-ci.org/zerkalica/reactive-di)

[![NPM](https://nodei.co/npm/reactive-di.png?downloads=true&stars=true)](https://nodei.co/npm/reactive-di/)

Dependency injection with reactivity, applied to react-like components, css-in-js, unobtrusive state-management. Compatible with flow, react, but free from framework lock-in (no React.createElement, Inferno.createVNode), etc.

Examples: [source](https://github.com/zerkalica/rdi-examples), [demo](http://zerkalica.github.io/rdi-examples/)

<!-- TOC depthFrom:2 depthTo:6 withLinks:1 updateOnSave:1 orderedList:0 -->

- [Install](#install)
- [Debug](#debug)
- [Hello world](#hello-world)
- [Features](#features)
	- [Typesafe context in components](#typesafe-context-in-components)
	- [State management based on lom_atom](#state-management-based-on-lomatom)
	- [Asyncronous code](#asyncronous-code)
	- [Error handling](#error-handling)
	- [Loading status handing](#loading-status-handing)
	- [Registering default dependencies](#registering-default-dependencies)
	- [Components cloning](#components-cloning)
	- [Hierarchical dependency injection](#hierarchical-dependency-injection)
	- [Optional css-in-js support](#optional-css-in-js-support)
	- [Passing component props to its depenendencies](#passing-component-props-to-its-depenendencies)
	- [React compatible](#react-compatible)
	- [Logging](#logging)
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

babel-plugin-transform-metadata is optional, used for metadata generation.

## Debug

Build rdi and copy to ../app-project/node_modules/reactive-di

```
npm run watch --reactive-di:dest=../app-project
```

## Hello world

In:

```js
// @flow
import {mem, action} from 'lom_atom'
import {createReactWrapper, createCreateElement, Injector} from 'reactive-di'
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
        ErrorableView
    ),
    h
)
global['lom_h'] = lomCreateElement

class HelloContext {
    @mem name = ''
}

function HelloView(
  {prefix}: {prefix: string},
  {context}: {context: HelloContext}
) {
    return <div>
        {prefix}, {context.name}
        <br/><input value={context.name} onInput={
            action((e: Event) => {
                context.name = (e.target: any).value
            })
        } />
    </div>
}

render(<HelloView prefix="Hello" />, document.body)
```

## Features

### Typesafe context in components

```js
// @flow
function HelloView(
  {prefix}: {prefix: string}, // props
  {context}: {context: HelloContext} // automatically injected reactive context
) {
    return <div>...</div>
}
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

Context signature generated from component via  [babel-plugin-transform-metadata](https://github.com/zerkalica/babel-plugin-transform-metadata).

Classes as keys. Without plugin, we need to define metadata manually:

```js
HelloView.deps = [{context: HelloContext}]
```

Injector in createElement (lom_h) automatically initializes HelloContext and pass it to HelloView in

```js
render(<HelloView prefix="Hello" />, document.body)
```

### State management based on lom_atom

Rdi based on [lom_atom](https://github.com/zerkalica/lom_atom), state management library, like mobx, but much simpler and with some killer features. Statefull or stateless components in rdi - pure functions.

Modifying state:

```js
import {action, mem} from 'lom_atom'

class HelloContext {
    @mem name = ''
}

function HelloView(
  _: {},
  {context}: {context: HelloContext}
) {
    return <input value={context.name} onInput={
        action((e: Event) => {
            context.name = (e.target: any).value
        })
    } />
}
```

All state changes are asynchronous, but for prevent loosing cursor position in react input, action helper used.

### Asyncronous code

Loading actual state:

```js
import {mem, force} from 'lom_atom'
class HelloContext {
    @force force: HelloContext

    @mem set name(next: string | Error) {}
    @mem get name(): string {
      fetch('/hello')
        .then((r: Response) => r.json())
        .then((data: Object) => {
          this.name = data.name
        })
        .catch((e: Error) => {
          this.name = e
        })

        throw new mem.Wait()
    }
}

function HelloView(
  _: {},
  context: HelloContext
) {
    return <div>
      <input value={context.name} onInput={
        action((e: Event) => {
            context.name = (e.target: any).value
        })
      } />
      <button onClick={() => { context.forced.name }}>Reload from server</button>
    </div>
}
```

First time ``` context.name ``` invokes fetch('/hello') and actualizes state, second time - ``` context.name ``` returns value from cache.

``` context.forced.name ``` invokes fetch handler again.

``` context.name = value ``` value sets directly into cache.

``` context.forced.name = value ``` invokes set name handler in HelloContext and sets into cache.

### Error handling

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
    return <input value={context.name} onInput={
        action((e: Event) => {
            context.name = (e.target: any).value
        })
    } />
}
```

Accessing ``` context.name ``` throws oops, try/catch in HelloView wrapper displays default ErrorableView, registered in rdi:

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
        ErrorableView
    ),
    h
)
global['lom_h'] = lomCreateElement
```

We can manually handle error:

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

    return <input value={name} onInput={
        action((e: Event) => {
            context.name = (e.target: any).value
        })
    } />
}
```

### Loading status handing

Looks like error handling. ``` throw new mem.Wait() ``` throws some specific exception.

```js
class HelloContext {
    @force force: HelloContext

    @mem set name(next: string | Error) {}
    @mem get name(): string {
      fetch('/hello')
        .then((r: Response) => r.json())
        .then((data: Object) => {
          this.name = data.name
        })
        .catch((e: Error) => {
          this.name = e
        })

        throw new mem.Wait()
    }
}
```

Catched in HelloComponent wrapper and default ErrorableView shows loader instead of HelloView.

```js
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
```

We can manually define loader in component, using try/catch:

```js
function HelloView(
  _: {},
  {context}: {context: HelloContext}
) {
    let name: string
    try {
      name = context.name
    } catch (e) {
      if (e instanceof mem.Wait) { name = 'Loading...' }
      else { throw e }
    }

    return <input value={name} onInput={
        action((e: Event) => {
            context.name = (e.target: any).value
        })
    } />
}
```

### Registering default dependencies

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

### Components cloning

Creates slightly modified component.

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

### Hierarchical dependency injection

```js
class SharedService {}
function Parent(
  props: {},
  context: {sharedService: SharedService}
) {
  return <Child parentService={context.sharedService} />
}

function Child(
  context: {sharedService: SharedService}
) {
  // context.sharedService instance cached in parent
}
```

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

Via adapters rdi supports css-in-js with reactivity and dependency injection power:

Setup:

```js
// @flow
import {mem} from 'lom_atom'
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
    update(name?: string, props: V): ISheet<V>;
    attach(): ISheet<V>;
    detach(): ISheet<V>;
    classes: {+[id: $Keys<V>]: string};
}
*/
const defaultDeps = []
const injector = new Injector(defaultDeps, jss)

const lomCreateElement = createCreateElement(
    createReactWrapper(
        Component,
        ErrorableView,
        injector
    ),
    h
)
global['lom_h'] = lomCreateElement
```

Usage:

```js
import {mem} from 'lom_atom'

class ThemeVars {
  @mem color = 'red'
}

function MyTheme(vars: ThemeVars) {
  return {
    wrapper: {
      backgroundColor: vars.color
    }
  }
}
MyTheme.theme = true

function MyView(
  props: {},
  {theme, vars}: {theme: MyTheme, vars: ThemeVars}
) {
  return <div class={theme.wrapper}>...<button onClick={() => vars.color = 'green'}>Change color</button></div>
}
```

Styles automatically mounts/unmounts with component. Changing ``` vars.color ``` automatically rebuild and remount css.

### Passing component props to its depenendencies

Sometimes we need to pass component properties to its services.

```js
import {mem, props} from 'lom_atom'

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

### React compatible

We still can use any react/preact/inferno components together rdi components.

### Logging

```js
import {defaultContext, BaseLogger} from 'lom_atom'
import type {ILogger} from 'lom_atom'

class Logger extends BaseLogger {
    /**
     * Invokes before atom creating
     *
     * @param host Object Object with atom
     * @param field string property name
     * @param key mixed | void for dictionary atoms - dictionary key
     */
    create<V>(host: Object, field: string, key?: mixed): V | void {}

    /**
     * After atom destroy
     */
    destroy(atom: IAtom<*>): void {}

    /**
     * Atom status changes
         - 'waiting' - atom fetching from server (mem.Wait throwed)
         - 'proposeToReap' - atom probably will be destroyed on next tick
         - 'proposeToPull' - atom will be actualized on next tick
     */
    status(status: ILoggerStatus, atom: IAtom<*>): void {}

    /**
     * Error while actualizing atom
     */
    error<V>(atom: IAtom<V>, err: Error): void {}

    /**
     * Atom value changed
     * @param isActualize bool if true - atom handler invoked, if false - only atom.cache value getted/setted
     */
    newValue<V>(atom: IAtom<V>, from?: V | Error, to: V, isActualize?: boolean): void {}
}

defaultContext.setLogger(new Logger())
```

## Credits

* [Ninject](https://github.com/ninject/Ninject) best dependency injector, writen in C#.
* [inversify.io](http://inversify.io/) nice try of reimplementing Ninject in typescript.
* [angular2](https://angular.io) ideas of hierarchical injectors.
* [babel-plugin-angular2-annotations](https://github.com/shuhei/babel-plugin-angular2-annotations) ideas of metadata for resolving dependencies.
* [babel-plugin-type-metadata](https://github.com/stephanos/babel-plugin-type-metadata) ideas of generating metadata for flowtypes.
