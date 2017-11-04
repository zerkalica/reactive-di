// @flow

import assert from 'assert'
import render from 'preact-render-to-string'
import {h, Component} from 'preact'
import {mem, detached as lomDetached} from 'lom_atom'
import {observable as mobxObservable, Reaction} from 'mobx'
import createReactWrapper, {createCreateElement} from '../src/createReactWrapper'
import createMobxDetached from '../src/createMobxDetached'

[
    ['mobx', createMobxDetached(Reaction), mobxObservable],
    ['lom_atom', lomDetached, mem]
].forEach(([lib, detached, observable]) => {
    describe('createReactWrapper.' + lib, () => {
        it('recursive autoresolve deps', () => {
            function ErrorView({error}: {error: Error}) {
                return lom_h('div', null, error.message)
            }

            const lom_h = createCreateElement(
                createReactWrapper(
                    Component,
                    ErrorView,
                    detached
                ),
                (h: React$CreateElement)
            )

            class Store {
                @observable some = 0
            }

            function MyView({store}: {store: Store}) {
                return lom_h('div', null, '' + store.some)
            }

            const props = {store: new Store}

            const myView = lom_h(MyView, props)
            assert(render(myView) === '<div>0</div>')
            props.store.some = 2
            assert(render(myView) === '<div>2</div>')
        })
    })
})
