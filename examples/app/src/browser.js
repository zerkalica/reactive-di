// @flow
/* eslint-env browser */

import React from 'react'
import ReactDOM from 'react-dom'
import jss from 'jss'
import jssCamel from 'jss-camel-case'

import {valueSetter, refsSetter, SourceStatus, DiFactory, ReactComponentFactory} from 'reactive-di/index'
import {hooks, theme, component, source} from 'reactive-di/annotations'

const userFixture = {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com'
}

// Fetcher service, could be injected from outside by key 'Fetcher' as is
@source({key: 'Fetcher', instance: true})
class Fetcher {
    fetch<V>(_url: string): Promise<V> {
        // fake fetcher for example
        return Promise.resolve((userFixture: any))
    }
}

@source({key: 'User'})
class User {
    id = 0
    name = ''
    email = ''
    set = valueSetter(this)
    setStatus = valueSetter(this, true)

    copy(rec: $Shape<this>): this {
        return Object.assign((Object.create(this.constructor.prototype): any), this, rec)
    }
}

@hooks(User)
class UserHooks {
    _fetcher: Fetcher

    constructor(fetcher: Fetcher) {
        this._fetcher = fetcher
    }

    willMount(user: User): void {
        user.setStatus._({type: 'pending'})
        this._fetcher.fetch('/user')
            .then((userData: $Shape<User>) => {
                user.setStatus._({type: 'complete'})
                user.set._(userData)
            })
            .catch((error: Error) => {
                user.setStatus._({type: 'error', error})
            })
    }

    willUnmount(): void {
        // this._updater.cancel()
    }
}

// Model ThemeVars, could be injected from outside by key 'ThemeVars' as ThemeVarsRec
@source({key: 'ThemeVars'})
class ThemeVars {
    color = 'red'
    set = valueSetter(this)

    copy(rec: $Shape<this>): this {
        return Object.assign((Object.create(this.constructor.prototype): any), this, rec)
    }
}


class UserService {
    _fetcher: Fetcher
    _user: User
    _tv: ThemeVars
    _refs: {
        name: ?HTMLElement;
    }

    setRef: {
        name: (e: HTMLElement) => void;
    }

    constructor(
        fetcher: Fetcher,
        user: User,
        tv: ThemeVars
    ) {
        this._fetcher = fetcher
        this._user = user
        this._tv = tv
        this._refs = {name: null}
        this.setRef = refsSetter(this._refs)
    }

    submit: () => void = () => {
    }

    changeColor: () => void = () => {
        this._tv.set.color('green')
    }
}

class LoadingUpdaterStatus extends SourceStatus {
    static statuses = [User, UserService]
}

class SavingUpdaterStatus extends SourceStatus {
    static statuses = [UserService]
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

function UserComponent(
    props: {},
    {theme: t, user, loading, saving, service}: UserComponentState
) {
    if (loading.pending) {
        return <div className={t.wrapper}>Loading...</div>
    }
    if (loading.error) {
        return <div className={t.wrapper}>Loading error: {loading.error.message}</div>
    }

    return <div className={t.wrapper}>
        <span className={t.name}>Name: <input
            ref={service.setRef.name}
            value={user.name}
            name="user.name"
            id="user.id"
            onChange={user.set.name}
        /></span>
        <button disabled={saving.pending} onClick={service.submit}>Save</button>
        {saving.error
            ? <div>Saving error: {saving.error.message}</div>
            : null
        }
    </div>
}
component()(UserComponent)


function ErrorView(
    {error}: {error: Error}
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
