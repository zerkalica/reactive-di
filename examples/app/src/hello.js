// @flow
/* eslint-env browser */

import {render, createVNode as infernoCreateVNode} from 'inferno'
import Component from 'inferno-component'
import {createReactRdiAdapter, DiFactory, BaseSetter} from 'reactive-di/index'

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
    createComponent: createReactRdiAdapter(Component)
})
    .create()

render(
    <Hello text="test"/>,
    window.document.getElementById('app')
)
