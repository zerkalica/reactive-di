# reactive-di

Definitely complete solution for dependency injection, state-to-css, state-to-dom rendering, data loading, optimistic updates and rollbacks.

[Dependency injection](https://en.wikipedia.org/wiki/Dependency_injection) with [flowtype](http://flowtype.org/) support, based on [ds300 derivablejs](https://ds300.github.io/derivablejs/). For old browsers needs Map, Observable, Promise and optionally Reflect, Symbol polyfills.

No statics, no singletones, abstract everything, configure everything.

Features:
-   Annotation based and highly flow-compatible
-   Can resolve dependencies from [flowtype](http://flowtype.org/) interfaces, types, classes via [babel metadata plugin](https://github.com/zerkalica/babel-plugin-transform-metadata).
-   Each dependency is [Derivable](http://ds300.github.io/derivablejs/#derivable-Derivable) or [Atom](http://ds300.github.io/derivablejs/#derivable-Atom)
-   Can easily provide abstraction level on top of any state-to-dom manipulating library: [react](https://facebook.github.io/react/), [preact](https://preactjs.com/), [bel](https://github.com/shama/bel), [mercury](https://github.com/Raynos/mercury/), etc.
-   Provide themes support via state-to-css library, like [jss](https://github.com/jsstyles/jss)
-   Mimic to react: flow-compatible widgets with props autocomplete support, that looks like react, but without react dependencies
-   Hierarchical - can create local state per widget, like in [angular2 di](https://angular.io/docs/ts/latest/guide/hierarchical-dependency-injection.html)
-   Type based selectors
-   Data loading via promises or observables
-   Optimistic updates with rollbacks
-   About 2500 SLOC with tests, 1000 without
-   Suitable for both node and the browser

## Flow

<img src="docs/flow.png" alt="reactive-di flow diagram" />

## Basic entities

-   source(key, init, construct) - atom source: model with data or service, can be injected from outside and changed in runtime.
-   factory - mark function factory, if not used [babel metadata plugin](https://github.com/zerkalica/babel-plugin-transform-metadata)
-   deps(...deps: mixed[]) - declare dependencies, if not used [babel metadata plugin](https://github.com/zerkalica/babel-plugin-transform-metadata)
-   component(...deps: Function[]) - any visual component
-   theme - jss-like style
-   updater(...updaters: Updater[]) - create loading status from updater services
-   service - for optimisations, do not recalculate, if dependencies changed, only call constructor with new deps


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
    {theme, user, loading, saving, service}: UserComponentState,
    h
): mixed {
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

More docs and examples coming soon.

### factory

### deps

### service

### source

### updaters

### theme

### component

## Manifest

-   DI as a glue, metaframework, abstraction from any framework, like react, angular, etc
-   Each dependency resolved by class definition to atom or derivable
-   Each dependency can be redefined at entry point
-   Avoid use use atoms, promises, observables, rxjs and another wrappers in you business code (except data fetching layer) - move them to DI. Keep business code clean.
-   Do not use interfaces as dependency key - use abstract classes or real classes (you can redefine them at entry point)
-   Most of widgets has an own context - state, do not pass properties from hi-order to low-order, bind as dependency
-   Minimum pure stateless widgets - only for low-level primitives
-   Widget class must be flow-compatible (autocomplete props)
-   Hooks componentDidMount and etc - only for raw dom manipulation, move data-loading to state/action layer
-   No difference between html or css - all controlled via state, do not use cssmodules, sass, less, stylus - all them are static, use js classes or functions with all OOP features: interfaces, compositions.
-   JSX and CSSX better than template strings for parsing and ast manipulations
-   DI abstraction powerfull, redux is unnecessary. Use interceptors instead of middlewares, use atoms instead of reducers, use di-injected functions or classes instead of ugly dispatcher + action struct.

## Credits

* [Ninject](https://github.com/ninject/Ninject) best dependency injector, writen in C#.
* [inversify.io](http://inversify.io/) nice try of reimplementing Ninject in typescript.
* [angular2](https://angular.io) ideas of hierarchical injectors.
* [mobx](http://mobxjs.github.io/mobx/) ideas of unobtrusive reactive state.
* [derivablejs](http://ds300.github.io/derivablejs) core engine of reactive-di
* [babel-plugin-angular2-annotations](https://github.com/shuhei/babel-plugin-angular2-annotations) ideas of metadata for resolving dependencies.
* [babel-plugin-type-metadata](https://github.com/stephanos/babel-plugin-type-metadata) ideas of generating metadata for flowtypes.
