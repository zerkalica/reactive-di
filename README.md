# Reactive DI  [![Build Status](https://secure.travis-ci.org/zerkalica/reactive-di.png)](http://travis-ci.org/zerkalica/reactive-di)

[![NPM](https://nodei.co/npm/reactive-di.png?downloads=true&stars=true)](https://nodei.co/npm/reactive-di/)

Dependency injection, applied to react-like components with reactivity, state-management, state-to-css, state-to-dom rendering.

Examples: [source](https://github.com/zerkalica/rdi-examples), [demo](http://zerkalica.github.io/rdi-examples/)

## Motivation

* Free from framework lock-in (React.createElement, Inferno.createVNode), etc
* jsx-based zero-dependency component, which can be used in any jsx-compatible render-to-dom library
* Use typesystem metadata to glue dependencies together (like in angular2 and typescript)
* reduce boilerplate code, using flow-types. Many decorators are unnecessary: use reflection metadata for classes, functions and components
* Any stream is wrapper on top of domain data. We need to automate and move most of all reactive-data stream manipulations behind the scene. For example, [mobx](http://mobxjs.github.io/mobx/) is good there.

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
  {prefix}: {prefix: string},
  {context}: {context: HelloContext}
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

### Save/restore injector state

```js
// @flow
import {mem, action, serializable} from 'lom_atom'
import {createReactWrapper, createCreateElement, Injector} from 'reactive-di'
import {render, h, Component} from 'preact'

const defaultState = {}

const injector = new Injector(
    undefined,
    undefined,
    defaultState
)

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

```js
class HelloContext {
    @serializable @mem get name() {
      // load name
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

renderToString(<HelloView/>)

// state filled with data
JSON.stringify(defaultState)
defaultState.HelloContext.name
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

injector.value(C).a instanceof SomeConcrete

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

// Creates copy, but remove FirstCounterAddButton and replace FirstCounterService to SecondCounterService.

const SecondCounterView = cloneComponent(FirstCounterView, [
    [FirstCounterService, SecondCounterService],
    ['FirstCounterAddButton', null],
], 'SecondCounterView')
```

### Hierarchical dependency injection

### Optional css-in-js support

### React compatible

We still can use any react/preact/inferno components together rdi components.

### Logging

## Credits

* [Ninject](https://github.com/ninject/Ninject) best dependency injector, writen in C#.
* [inversify.io](http://inversify.io/) nice try of reimplementing Ninject in typescript.
* [angular2](https://angular.io) ideas of hierarchical injectors.
* [babel-plugin-angular2-annotations](https://github.com/shuhei/babel-plugin-angular2-annotations) ideas of metadata for resolving dependencies.
* [babel-plugin-type-metadata](https://github.com/stephanos/babel-plugin-type-metadata) ideas of generating metadata for flowtypes.
