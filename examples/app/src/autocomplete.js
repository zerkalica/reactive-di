// @flow
/* eslint-env browser */

import {render, createVNode as infernoCreateVNode} from 'inferno'
import Component from 'inferno-component'
import {createReactRdiAdapter, DiFactory, BaseSetter, SourceStatus} from 'reactive-di/index'
import {hooks, source} from 'reactive-di/annotations'

const fixture: any = []

const maxItems = 5

for (let i = 0; i < maxItems; i++) {
    fixture.push({
        id: i + 1,
        name: 'John Doe ' + i
    })
}

// Fetcher service, could be injected from outside by key 'Fetcher' as is
@source({instance: true})
class Fetcher {
    _count = 0
    fetch(_url: string, params: {body: Object; method?: string}): Promise<any> {
        // fake fetcher for example
        console.log(`fetch ${_url} ${JSON.stringify(params)}`) // eslint-disable-line
        return new Promise((resolve: (v: any) => void, reject: (e: Error) => void) => {
            const isError = false
            setTimeout(() => {
                return isError
                    ? reject(new Error('Fake error'))
                    : resolve(params.body.name
                        ? fixture.filter((item: Object) => {
                            return item.name.indexOf(params.body.name) !== -1
                        })
                        : []
                    )
            }, 600)
        })
    }
}

class User {
    name = ''
}

interface IVariant {
    name: string;
}

class Variants extends Array<IVariant> {}
@hooks(Variants)
class VariantsHooks {
    _user: User
    _fetcher: Fetcher
    _handler: ?number

    constructor(user: User, fetcher: Fetcher) {
        this._user = user
        this._fetcher = fetcher
    }

    pull(): ?Promise<IVariant[]> {
        const f = this._fetcher
        const user = this._user
        // If first init and user.name is empty - do not load from server
        if (!this._handler && !user.name) {
            return null
        }
        // debounce timer
        clearTimeout(this._handler)

        return new Promise((resolve: (v: Promise<IVariant[]>) => void) => {
            this._handler = setTimeout(() => {
                resolve(f.fetch('/users', {
                    body: {
                        name: user.name
                    }
                }))
            }, 700)
        })
    }
}

class VariantsStatus extends SourceStatus {
    static statuses = [Variants]
}

function AutoComplete(
    {text}: {
        text: string;
    },
    {user, variants, variantsStatus}: {
        user: User;
        variants: Variants;
        variantsStatus: VariantsStatus;
    }
) {
    const set = new BaseSetter(user).create(BaseSetter.createEventSet)

    return <div>
        <h1>AutoComplete</h1>
        <input value={user.name} onInput={set.name} placeholder="John"/>
        <br/>
        <div>
            {variantsStatus.pending ? 'loading...' : 'complete'}
        </div>
        {!variants.length ? null :
        <ul>
            {variants.map((variant: IVariant) =>
                <li>
                    {variant.name}
                </li>
            )}
        </ul>
        }
    </div>
}

// used in jsx below, jsx pragma t
const _t = new DiFactory({ // eslint-disable-line
    values: {
        Fetcher: new Fetcher()
    },
    createVNode: infernoCreateVNode,
    createComponent: createReactRdiAdapter(Component)
})
    .create()

render(
    <AutoComplete text="" />,
    window.document.getElementById('app')
)
