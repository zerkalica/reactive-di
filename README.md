# Reactive DI  [![Build Status](https://secure.travis-ci.org/zerkalica/reactive-di.png)](http://travis-ci.org/zerkalica/reactive-di)

[![NPM](https://nodei.co/npm/reactive-di.png?downloads=true&stars=true)](https://nodei.co/npm/reactive-di/)

Solution for dependency injection and state-management, state-to-css, state-to-dom rendering, data loading, optimistic updates and rollbacks.

## About

Hierarchical scope, state management IoC container uses a class constructor or function signature to identify and inject its dependencies.

There are many IoC containers for javascript, for example [inversify](http://inversify.io/), but reactive-di works without registering dependencies in container and has some state management features, like [mobx](http://mobxjs.github.io/mobx/).

All dependencies presented as [atoms](http://ds300.github.io/derivablejs/#derivable-atom) or [derivables](http://ds300.github.io/derivablejs/#derivable-Derivable).

## Motivation

We need good OO design with [Composition reuse](https://en.wikipedia.org/wiki/Composition_over_inheritance) and [SOLID](https://en.wikipedia.org/wiki/SOLID_(object-oriented_design)) in complex javascript applications on sever and client.

Any stream is wrapper on top of domain data. We need to automate and move most of all reactive-data stream manipulations behind the scene. For example, [mobx](http://mobxjs.github.io/mobx/) is good there.

We need to reduce boilerplate code, by maximally using flow-types. Many decorators are unnecessary: use reflection metadata for classes, functions and components.

We need to keep all components clean and usable without di: decorators must be used only for additional metadata, not as wrappers.

We need to move dependencies at react-like frameworks from compiletime to runtime. It give posibility to create unified jsx-based zero-dependency component, which can be used in any jsx-compatible render-to-dom library.

We need to provide unified cssx-based component which can be used in any jss-compatible render-to-css library.

## Install

```
npm install --save reactive-di
npm install --save-dev babel-plugin-transform-metadata
```

For using zero-dependency components, we need to define jsx pragma in transform-metadata:

.babelrc:

```json
{
    "plugins": [
        ["transform-metadata", {
            "jsxPragma": "__h"
        }],
        ["transform-react-jsx", {
            "pragma": "__h"
        }]
    ]
}
```

reactive-di requires some polyfills: Promise, Observable (only if observables used in application code), Map, Set, Proxy (only for middlewares).

## Basics

Reactive di container use classes or functions as unique identifiers of dependency.

```js
// @flow
import {Di} from 'reactive-di'
import type {Derivable} from 'reactive-di'

class Logger {
    log(message: string): void {
        console.log(message)
    }
}

class TestClass {
    constructor(logger: Logger) {
        this._logger = logger
    }
    add(a: number): number {
        this._logger.log(`calling add ${a} + 1`)
        return a + 1
    }
}

const di = new Di()
const testClass: Derivable<TestClass> = di.val(TestClass)
testClass.get().add(1)
```

## Architecture overview

<img src="https://rawgithub.com/zerkalica/reactive-di/master/docs/workflow-state.svg" alt="reactive-di flow diagram" />

## Sources

Source is [atom](http://ds300.github.io/derivablejs/#derivable-atom) with data object.
Source looks like pure data class with initial state. Source decorator can give some options: key: string - unique name of model class, this keys helps to associate models with data in json-object from prerender server.

```js
// @flow
import {source} from 'reactive-di/annotations'

interface UserRec {
    id?: string;
    name?: string;
}

@source({key: 'user'})
class User {
    id: string
    name: string

    constructor(rec?: UserRec = {}) {
        this.id = rec.id || ''
        this.name = rec.name || ''
    }
}
```

Or using reactive-di helper:

```js
//...
@source({key: 'user'})
class User extends BaseModel<UserRec>{
    id: string
    name: string
    static defaults: UserRec = {
        id: '',
        name: ''
    }
}
```

Source is updateable:

```js
// @flow
import {Di} from 'reactive-di'

// Updating source manually:
const userAtom = (new Di()).val(User)
userAtom.get() // User object
userAtom.set(new User(...))
```

## Service

Service is regular class or factory-functon with some actions: source manipulations.

```js
// @flow
import {Di} from 'reactive-di'
import {source} from 'reactive-di/annotations'
@source({key: 'user'})
class User {
    id: string
    name: string
}

class UserService {
    _user: User
    constructor(user: User) {
        this._user = user
    }

    submit(): void {

    }
}

// or as factory-function:
function createUserSubmit(user: User) {
    return function userSubmit() {
        // submit user
    }
}


const userServiceAtom = (new Di()).val(UserService)
userServiceAtom.get().submit()
userAtom.set(new User(...))
// User changed --> UserService changed, get new service
userServiceAtom.get().submit()
```

Usually you don't need to listen Service changes in component, use service decorator to detach service from atom updates:

```js
// @flow
import {Di} from 'reactive-di'
import {service} from 'reactive-di/annotations'

@service
class UserService {
}
```

## Components

Component is function, where first argument is properties, second - is internal component state (dependencies), and third - is element factory: function(tag, props, children). In this form components does not depends on any react-like framework.

Di container injects state into each component by wrapping creteElement method, passed to each component function. Di does not use [react context](https://facebook.github.io/react/docs/context.html), this is only react-feature.

```js
// @flow
export type SrcComponent<Props, State> = (props: Props, state: State, h: ?((tag, props, children) => any)) => any
```

[babel metadata plugin](https://github.com/zerkalica/babel-plugin-transform-metadata) autodetects functions with jsx and places h argument automatically.

Example:

```js
// @flow

import React from 'react'
import {Di, ReactComponentFactory} from 'reactive-di'

interface UserProps {
    id: string;
    name: string;
}

interface UserState {
    service: UserService;
}

export function User({id, name}: UserProps, {service}: UserState): mixed {
    return <div>
        User: {name}#{id}
        <a href="#" onClick={service.edit}>[change]</a>
    </div>
}

const di = new Di(new ReactComponentFactory(React))
const UserWithState: typeof User = di.wrapComponent(User)
React.render(<UserWithState id="1", name="2" />, document.body)
```

## Themes

Theme is dependency with [jss](https://github.com/cssinjs/jss) object and css class names. On first component mount - theme invokes factory, which passed to di options at entry point and attach css to dom. On last component unmount css part will be removed.

```js
// @flow
import {theme} from 'reactive-di/annotations'

@theme
class UserTheme {
    wrapper: string
    name: string

    __css: mixed
    constructor(deps: SomeDeps) {
        this.__css {
            wrapper: {
                backgroundColor: 'white'
            },
            name: {
                backgroundColor: 'red'
            }
        }
    }
}

interface UserProps {
    id: string;
    name: string;
}

interface UserState {
    service: UserService;
    theme: UserTheme;
}

export function User({id, name}: UserProps, {theme, service}: UserState): mixed {
    return <div className={theme.wrapper}>
        User: <span className={theme.name}>{name}#{id}</span>
        <a href="#" onClick={service.edit}>[change]</a>
    </div>
}
```

## Lifecycles

Hooks used for handling component mount/unmount cycles and target updates. Where target - is any dependency, which hook belongs to. Hooks can be attached to any dependency, not only component. Components, which use this dependency, automatically update hook on first component mount and last component unmount.

```js
//@flow
export interface LifeCycle<Dep> {
    /**
    * Called on first mount of any component, which uses description
     */
    onMount?: (dep: Dep) => void;

    /**
    * Called on last unmount of any component, which uses description
     */
    onUnmount?: (dep: Dep) => void;

    /**
     * Called on Dep dependencies changes
     */
    onUpdate?: (oldDep: Dep, newDep: Dep) => void;
}
```

Example:

```js
//@flow
import {hooks}

class UserService {
    start(): void {
        // subscribe to some observable
    }
    stop(): void {
        // unsubscribe from observable
    }
}

@hooks(UserService)
class UserServiceHooks {
    /**
     * Hooks is regular dependency: we can use injection in constructor
     */
    constructor(deps: SomeDeps) {}
    /**
     * Called on first mount of any component, which use UserService
     */
    onMount(userService: UserService): void {
        userServiuce.start()
    }
    /**
     * Called on last unmount of any component, which use UserService
     */
    onUnmount(userService: UserService): void {
        userService.stop()
    }
    /**
     * Called on UserService constructor dependencies updates
     */
    onUpdate(oldUserService: UserService, newUserService: UserService): void {
        oldUserService.stop()
        newUserService.start()
    }
}
```

## Middlewares

Middlewares used in development for logging method calls and property get/set.

```js
// @flow

export interface ArgsInfo {
    id: string;
    type: string;
    className: ?string;
    propName: string;
}
export interface Middleware {
    get?: <R>(value: R, info: ArgsInfo) => R;
    set?: <R>(oldValue: R, newValue: R, info: ArgsInfo) => R;
    exec?: <R>(resolve: (...args: any[]) => R, args: any[], info: ArgsInfo) => R;
}
```

```js
// @flow
import type {ArgsInfo, Middleware} from 'reactive-di'
class Mdl1 {
    exec<R>(fn: (args: any[]) => R, args: any[], info: ArgsInfo): R {
        console.log(`begin ${info.className ? 'method' : 'function'} ${info.id}`)
        const result: R = fn(args)
        console.log(`end ${info.id}`)

        return result
    }

    get<R>(result: R, info: ArgsInfo): R {
        console.log(`get ${info.id}: ${result}`)
        return result
    }

    set<R>(oldValue: R, newValue: R, info: ArgsInfo): R {
        console.log(`${info.id} changed from ${oldValue} to ${newValue}`)
        return newValue
    }
}

function createAdd(): (a: string) => {
    return function add(a: string): string {
        return a + 'b'
    }
}

class Service {
    add(a: string): string {
        return a + 'b'
    }
}

const di = (new Di()).middlewares([Mdl1])

// Function factories calls:
di.val(createAdd).get()('a')
// begin function add
// end add

// Class method calls
di.val(Service).get().add('a')
// begin method Service.add
// end Service.add

class TestClass {
    a: string = '1'
}

const tc: TestClass = di.val(TestClass).get()

// Propery set/get:
tc.a
// get TestClass.a: 1
tc.a = '123'
// TestClass.a changed from 1 to 213
```

## Complete example

Compile with [babel metadata plugin](https://github.com/zerkalica/babel-plugin-transform-metadata).

```js
// @flow
import React from 'react'
import ReactDOM from 'react-dom'
import jss from 'jss'
import jssCamel from 'jss-camel-case'

import {Updater, UpdaterStatus, Di, ReactComponentFactory} from 'reactive-di/index'
import {hooks, theme, component, updaters, source} from 'reactive-di/annotations'

const userFixture = {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com'
}

// Fetcher service, could be injected from outside by key 'Fetcher' as is
@source({key: 'Fetcher', construct: false})
class Fetcher {
    fetch<V>(url: string): Promise<V> {
        // fake fetcher for example
        return Promise.resolve((userFixture: any))
    }
}

// Create separate updater qeue for user
class UserUpdater extends Updater {}

@source({key: 'User'})
class User {
    static Updater: Class<Updater> = UserUpdater

    id: number
    name: string
    email: string

    constructor(rec: Object) {
        this.id = rec.id
        this.name = rec.name
        this.email = rec.email
    }
}

@hooks(User)
class UserHooks {
    _updater: Updater
    _fetcher: Fetcher

    constructor(fetcher: Fetcher, updater: Updater) {
        this._fetcher = fetcher
        this._updater = updater
    }

    onMount(user: User): void {
        this._updater.setSingle(
            () => this._fetcher.fetch('/user'),
            User
        )
    }

    onUnmount(user: User): void {
        this._updater.cancel()
    }
}

class UserServiceUpdater extends Updater {}
class UserService {
    static Updater: Class<Updater> = UserServiceUpdater
    _updater: Updater
    _fetcher: Fetcher
    _user: User

    constructor(
        fetcher: Fetcher,
        updater: Updater,
        user: User
    ) {
        this._fetcher = fetcher
        this._updater = updater
        this._user = user
    }

    submit: () => void = () => {
        this._updater.set([

        ])
    }

    changeColor: () => void = () => {
        this._updater.setSingle({color: 'green'}, ThemeVars)
    }
}

@updaters(User.Updater, UserService.Updater)
class LoadingUpdaterStatus extends UpdaterStatus {}

@updaters(UserService.Updater)
class SavingUpdaterStatus extends UpdaterStatus {}

// Model ThemeVars, could be injected from outside by key 'ThemeVars' as ThemeVarsRec
@source({key: 'ThemeVars'})
class ThemeVars {
    color: string
    constructor(r?: Object = {}) {
        this.color = r.color || 'red'
    }
}

// Provide class names and data for jss in __css property
@theme
class UserComponentTheme {
    wrapper: string
    status: string
    name: string

    __css: mixed

    constructor(vars: ThemeVars) {
        this.__css = {
            wrapper: {
                backgroundColor: `rgb(${vars.color}, 0, 0)`
            },
            status: {
                backgroundColor: 'red'
            },
            name: {
                backgroundColor: 'green'
            }
        }
    }
}

interface UserComponentProps {
    children?: mixed;
}

interface UserComponentState {
    theme: UserComponentTheme;
    user: User;
    loading: LoadingUpdaterStatus;
    saving: SavingUpdaterStatus;
    service: UserService;
}

/* jsx-pragma h */
function UserComponent(
    {children}: UserComponentProps,
    {theme, user, loading, saving, service}: UserComponentState
) {
    if (loading.pending) {
        return <div class={theme.wrapper}>Loading...</div>
    }
    if (loading.error) {
        return <div class={theme.wrapper}>Loading error: {loading.error.message}</div>
    }

    return <div className={theme.wrapper}>
        <span className={theme.name}>Name: {user.name}</span>
        {children}
        <button disabled={saving.pending} onClick={service.submit}>Save</button>
        {saving.error
            ? <div>Saving error: {saving.error.message}, <a href="#" onClick={saving.retry}>Retry</a></div>
            : null
        }
    </div>
}
component()(UserComponent)

jss.use(jssCamel)
const node: HTMLElement = window.document.getElementById('app')
const render = (widget: Function, attrs: ?Object) => ReactDOM.render(React.createElement(widget, attrs), node)

const di = (new Di(
    new ReactComponentFactory(React),
    (styles) => jss.createStyleSheet(styles)
))
    .values({
        Fetcher: new Fetcher()
    })

render(di.wrapComponent(UserComponent))
```

## Manifest

-   DI as an abstraction from any react-like framework, which supports createElement
-   Each dependency resolved by class definition to atom or derivable
-   Each dependency can be redefined at entry point
-   Avoid use use atoms, promises, observables, rxjs and another wrappers in you business code (except data fetching layer) - move them to DI. Keep business code clean.
-   Do not use interfaces as dependency key - use abstract classes or real classes (you can redefine them at entry point)
-   Most of widgets has an own context - state, do not pass properties from hi-order to low-order, bind as dependency
-   Minimum pure stateless widgets - only for low-level primitives
-   Widget must be flow-compatible (autocomplete props)
-   Hooks is separated class - as in cyclejs
-   No difference between html or css - all controlled via state, do not use cssmodules, sass, less, stylus - all them are static, use js classes or functions with all OOP features: interfaces, compositions.
-   JSX and CSSX better than template strings for parsing and ast manipulations
-   Do not use redux-like actions, use functions or service classes. Di abstracts them from its realization. Di provide middlewares for them.
-   Do not use redux-like dispatchers: di automatically thunkify all functions.
-   Do not use redux-like stores: In di each store case block presented as pure function or service method with context.

## Credits

* [Ninject](https://github.com/ninject/Ninject) best dependency injector, writen in C#.
* [inversify.io](http://inversify.io/) nice try of reimplementing Ninject in typescript.
* [angular2](https://angular.io) ideas of hierarchical injectors.
* [mobx](http://mobxjs.github.io/mobx/) ideas of unobtrusive reactive state.
* [derivablejs](http://ds300.github.io/derivablejs) core engine of reactive-di
* [babel-plugin-angular2-annotations](https://github.com/shuhei/babel-plugin-angular2-annotations) ideas of metadata for resolving dependencies.
* [babel-plugin-type-metadata](https://github.com/stephanos/babel-plugin-type-metadata) ideas of generating metadata for flowtypes.
