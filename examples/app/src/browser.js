// @flow
/* eslint-env browser */

import React from 'react'
import ReactDOM from 'react-dom'
import jss from 'jss'
import jssCamel from 'jss-camel-case'

import {refsSetter, eventSetter, setter, BaseModel, Updater, SourceStatus, DiFactory, ReactComponentFactory} from 'reactive-di/index'
import {actions, hooks, deps, theme, component, source} from 'reactive-di/annotations'

const userFixture = {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com'
}

// Fetcher service, could be injected from outside by key 'Fetcher' as is
@source({key: 'Fetcher', instance: true})
class Fetcher {
    _count = 0
    fetch<V>(_url: string): Promise<V> {
        // fake fetcher for example

        return new Promise((resolve: (v: V) => void, reject: (e: Error) => void) => {
            const isError = false
            setTimeout(() => {
                return isError
                    ? reject(new Error('Fake error'))
                    : resolve(userFixture)
            }, 600)
        })
    }
}

@source({key: 'User'})
class User extends BaseModel {
    id = 0
    name = ''
    email = ''
}

@deps(Fetcher, Updater)
@hooks(User)
class UserHooks {
    _fetcher: Fetcher
    _updater: Updater

    constructor(fetcher: Fetcher, updater: Updater) {
        this._fetcher = fetcher
        this._updater = updater
    }

    willMount(user: User): void {
        this._updater.run(user, this._fetcher.fetch('/user'))
    }
}

// Model ThemeVars, could be injected from outside by key 'ThemeVars' as ThemeVarsRec
@source({key: 'ThemeVars'})
class ThemeVars extends BaseModel {
    color = 'red'
}

class UserRefs {
    name: ?HTMLElement = null
    set = refsSetter(this)
}

@deps(
    Fetcher,
    User,
    UserRefs,
    ThemeVars
)
@actions
class UserService {
    _fetcher: Fetcher
    _user: User
    _tv: ThemeVars
    _refs: UserRefs

    constructor(
        fetcher: Fetcher,
        user: User,
        refs: UserRefs,
        tv: ThemeVars
    ) {
        this._fetcher = fetcher
        this._user = user
        this._tv = tv
        this._refs = refs
    }

    submit(): void {
        debugger
    }

    changeColor(): void {
        setter(this._tv).color('green')
    }
}

@deps(User)
class ComputedUser {
    user: User
    fullName: string

    constructor(user: User) {
        this.fullName = `${user.name} <${user.email}>`
        this.user = user
    }
}

class LoadingUpdaterStatus extends SourceStatus {
    static statuses = [UserService]
}

class SavingUpdaterStatus extends SourceStatus {
    static statuses = [UserService]
}

// Provide class names and data for jss in __css property
@deps({
    vars: ThemeVars
})
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
    refs: UserRefs;
    loading: LoadingUpdaterStatus;
    saving: SavingUpdaterStatus;
    service: UserService;
}

function UserComponent(
    props: {},
    {theme: t, user, saving, loading, refs, service}: UserComponentState,
    _t: any
) {
    // const user = cuser.user
    if (loading.pending) {
        return <div className={t.wrapper}>Loading...</div>
    }
    if (loading.error) {
        return <div className={t.wrapper}>Loading error: {loading.error.message}</div>
    }

    const userSetter = eventSetter(user)

    return <div className={t.wrapper}>
        <span className={t.name}>Name: <input
            ref={refs.set.name}
            value={user.name}
            name="user.name"
            id="user.id"
            onChange={userSetter.name}
        /></span>
        <button onClick={service.submit}>Save</button>
        {/* {saving.error
            ? <div>Saving error: {saving.error.message}</div>
            : null
        } */}
    </div>
}
deps({
    theme: UserComponentTheme,
    user: User,
    refs: UserRefs,
    loading: LoadingUpdaterStatus,
    // saving: SavingUpdaterStatus,
    service: UserService
})(UserComponent)
component()(UserComponent)

function ErrorView(
    {error}: {error: Error},
    _t: any
) {
    return <div>{error.message}</div>
}
component()(ErrorView)

jss.use(jssCamel)

const di = (new DiFactory({
    values: {
        Fetcher: new Fetcher()
    },
    defaultErrorComponent: ErrorView,
    themeFactory: jss,
    componentFactory: new ReactComponentFactory(React)
}))
    .create()

ReactDOM.render(
    React.createElement(di.wrapComponent(UserComponent)),
    window.document.getElementById('app')
)
