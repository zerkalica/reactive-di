# Reactive DI  [![Build Status](https://secure.travis-ci.org/zerkalica/reactive-di.png)](http://travis-ci.org/zerkalica/reactive-di)

[![NPM](https://nodei.co/npm/reactive-di.png?downloads=true&stars=true)](https://nodei.co/npm/reactive-di/)

Dependency injection with reactivity, state-management, state-to-css, state-to-dom rendering.

Examples: [source](https://github.com/zerkalica/rdi-examples), [demo](http://zerkalica.github.io/rdi-examples/)

## Motivation

* Free from framework lock-in (React.createElement, Inferno.createVNode), etc
* jsx-based zero-dependency component, which can be used in any jsx-compatible render-to-dom library
* Use typesystem metadata to glue dependencies together (like in angular2 and typescript)
* reduce boilerplate code, by maximally using flow-types. Many decorators are unnecessary: use reflection metadata for classes, functions and components
* Any stream is wrapper on top of domain data. We need to automate and move most of all reactive-data stream manipulations behind the scene. For example, [mobx](http://mobxjs.github.io/mobx/) is good there.

## Install

```
npm install --save reactive-di lom_atom
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
import {mem} from 'lom_atom'
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
            (e: Event) => {
                context.name = (e.target: any).value
            }
        } />
    </div>
}
HelloView.deps = [{context: HelloContext}]


render(<HelloView prefix="Hello" />, document.body)
```

## Credits

* [Ninject](https://github.com/ninject/Ninject) best dependency injector, writen in C#.
* [inversify.io](http://inversify.io/) nice try of reimplementing Ninject in typescript.
* [angular2](https://angular.io) ideas of hierarchical injectors.
* [babel-plugin-angular2-annotations](https://github.com/shuhei/babel-plugin-angular2-annotations) ideas of metadata for resolving dependencies.
* [babel-plugin-type-metadata](https://github.com/stephanos/babel-plugin-type-metadata) ideas of generating metadata for flowtypes.
