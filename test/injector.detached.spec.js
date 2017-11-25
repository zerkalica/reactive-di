// @flow

import assert from 'assert'
import {createElement, Component} from 'preact'
import {observable as mobxObservable, Reaction,} from 'mobx'
import {detached as lomDetached, defaultContext, mem, action} from 'lom_atom'
import createReactWrapper from '../src/createReactWrapper'
import createCreateElement from '../src/createCreateElement'
import createMobxDetached from '../src/createMobxDetached'

[
    ['mobx', createMobxDetached(Reaction), mobxObservable],
    ['lom_atom', lomDetached, mem]
].forEach(([lib, detached, observable]) => {
    describe(`Injector.detached.${lib}`, () => {
        class A {
            @observable some = 1
        }

        it('cached result', () => {
            let called = 0
            class B {
                a = new A()
                @detached foo(force?: boolean): number {
                    called++
                    return 1 + this.a.some
                }
            }
            const b = new B()
            assert(b.foo() === 2)
            assert(called === 1)
            b.foo()
            assert(called === 1)
        })

        it('force resets cache', () => {
            let called = 0
            class B {
                a = new A()
                @detached foo(force?: boolean): number {
                    called++
                    return 1 + this.a.some
                }
            }
            const b = new B()
            b.foo()
            b.foo(true)
            assert(called === 2)
        })

        it('updating value', () => {
            let called = 0
            class B {
                a = new A()
                @detached foo(force?: boolean): number {
                    called++
                    return 1 + this.a.some
                }
            }
            const b = new B()
            b.foo()
            action(() => {
                b.a.some++
            })()
            b.foo()
            assert(called === 2)
        })
    })
})
