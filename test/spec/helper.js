// @flow

import {createVNode} from 'inferno'
import Component from 'inferno-component'
import {DiFactory, createReactRdiAdapter} from 'reactive-di/index'

export function createDi() {
    const diFactory = new DiFactory({
        createVNode,
        createComponent: createReactRdiAdapter(Component)
    })

    return diFactory
}
