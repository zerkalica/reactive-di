// @flow
/* eslint-env browser */

import React from 'react'
import ReactDOM from 'react-dom'
import jss from 'jss'
import jssCamel from 'jss-camel-case'

import {getSetter, getStatus, SourceStatus, DiFactory, ReactComponentFactory} from 'reactive-di/index'
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
    _fetcher: Fetcher
    _user: User

    constructor(fetcher: Fetcher, user: User) {
        this._fetcher = fetcher
        this._user = user
    }

    willMount(): void {
        const status = getStatus(this._user)
        const statVal = status.get()
        status.set(statVal.copy('pending'))
        this._fetcher.fetch('/user')
            .then((user: Object) => {
                status.set(statVal.copy('complete'))
                getSetter(this._user).merge(user, true)
            })
            .catch((error: Error) => {
                status.set(statVal.copy('error', error))
            })
    }

    willUnmount(_user: User): void {
        // this._updater.cancel()
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


class UserService {
    _fetcher: Fetcher
    _user: User
    _tv: ThemeVars

    constructor(
        fetcher: Fetcher,
        user: User,
        tv: ThemeVars
    ) {
        this._fetcher = fetcher
        this._user = user
        this._tv = tv
    }

    submit: () => void = () => {
    }

    changeColor: () => void = () => {
        getSetter(this._tv).merge({color: 'green'}, true)
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
    {children}: UserComponentProps,
    {theme: t, user, loading, saving, service}: UserComponentState
) {
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
            ? <div>Saving error: {saving.error.message}</div>
            : null
        }
    </div>
}
component()(UserComponent)

jss.use(jssCamel)

const di = (new DiFactory({
    values: {
        AbstractSheetFactory: jss,
        Fetcher: new Fetcher()
    },
    componentFactory: new ReactComponentFactory(React)
}))
    .create()

ReactDOM.render(
    React.createElement(di.wrapComponent(UserComponent)),
    window.document.getElementById('app')
)
