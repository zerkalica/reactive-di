// @flow
/* eslint-env browser */

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
    fetch<V>(_url: string): Promise<V> {
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

    onMount(_user: User): void {
        this._updater.setSingle(
            () => this._fetcher.fetch('/user'),
            User
        )
    }

    onUnmount(_user: User): void {
        this._updater.cancel()
    }
}

// Model ThemeVars, could be injected from outside by key 'ThemeVars' as ThemeVarsRec
@source({key: 'ThemeVars'})
class ThemeVars {
    color: string
    constructor(r?: Object = {}) {
        this.color = r.color || 'red'
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
    {theme: t, user, loading, saving, service}: UserComponentState,
    _h
): mixed {
    if (loading.pending) {
        return <div className={t.wrapper}>Loading...</div>
    }
    if (loading.error) {
        return <div className={t.wrapper}>Loading error: {loading.error.message}</div>
    }

    return <div className={t.wrapper}>
        <span className={t.name}>Name: {user.name}</span>
        {children}
        <button disabled={saving.pending} onClick={service.submit}>Save</button>
        {saving.error
            ? <div>Saving error: {saving.error.message}, <a href="/" onClick={saving.retry}>Retry</a></div>
            : null
        }
    </div>
}
component()(UserComponent)

jss.use(jssCamel)
const node: HTMLElement = window.document.getElementById('app')
const render = (widget: Function, attrs: ?Object) => {
    ReactDOM.render(React.createElement(widget, attrs), node)
}

const di = (new Di(
    new ReactComponentFactory(React),
    (styles) => jss.createStyleSheet(styles)
))
    .values({
        Fetcher: new Fetcher()
    })

render(di.wrapComponent(UserComponent))
