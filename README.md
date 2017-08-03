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

## Architecture overview

<img src="https://rawgithub.com/zerkalica/reactive-di/master/docs/workflow-state.svg" alt="reactive-di flow diagram" />

## Install

```
npm install --save reactive-di
npm install --save-dev babel-plugin-transform-metadata babel-plugin-inferno
```

For using zero-dependency components, we need to define jsx pragma in transform-metadata:

.babelrc:

```json
{
    "plugins": [
        ["transform-metadata", {
            "addDisplayName": true,
            "jsxPragma": "_t"
        }],
        ["inferno", {
            "pragma": "_t.h"
        }]
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
/* eslint-env browser */

import {render, createVNode as infernoCreateVNode} from 'inferno'
import Component from 'inferno-component'
import {createReactRdiAdapter, DiFactory, BaseSetter} from 'reactive-di'

class User {
    name = ''
}

function Hello(
    {text}: {
        text: string;
    },
    {user}: {
        user: User;
    }
) {
    const set = new BaseSetter(user).create(BaseSetter.createEventSet)
    return <div>
        <h1>Hello {user.name}</h1>
        <input value={user.name} onInput={set.name} />
    </div>
}

// used in jsx below, jsx pragma t
const _t = new DiFactory({ // eslint-disable-line
    createVNode: infernoCreateVNode,
    component: createReactRdiAdapter(Component)
})
    .create()

render(
    <Hello text="test"/>,
    window.document.getElementById('app')
)
```

Out:

```js
// ...
var User = function User() {
    _classCallCheck(this, User);

    this.name = '';
};


function Hello(_ref, _ref2, _t) {
    var text = _ref.text;
    var user = _ref2.user;

    var set = new _src.BaseSetter(user).create(_src.BaseSetter.createEventSet);
    return _t.h(2, 'div', null, [_t.h(2, 'h1', null, ['Hello ', user.name]), _t.h(512, 'input', {
        'value': user.name
    }, null, {
        'onInput': set.name
    })]);
}

Hello.displayName = 'Hello';
Hello._r2 = 1;
Hello._r1 = [{
    user: User
}];
var _t = new _src.DiFactory({
    createVNode: _inferno.createVNode,
    component: (0, _src.createReactRdiAdapter)(_infernoComponent2.default)
}).create();

(0, _inferno.render)(_t.h(16, Hello, null, null, { text: 'test' }), window.document.getElementById('app'));

```

## Credits

* [Ninject](https://github.com/ninject/Ninject) best dependency injector, writen in C#.
* [inversify.io](http://inversify.io/) nice try of reimplementing Ninject in typescript.
* [angular2](https://angular.io) ideas of hierarchical injectors.
* [mobx](http://mobxjs.github.io/mobx/) ideas of unobtrusive reactive state.
* [derivablejs](http://ds300.github.io/derivablejs) core engine of reactive-di
* [babel-plugin-angular2-annotations](https://github.com/shuhei/babel-plugin-angular2-annotations) ideas of metadata for resolving dependencies.
* [babel-plugin-type-metadata](https://github.com/stephanos/babel-plugin-type-metadata) ideas of generating metadata for flowtypes.
