// @flow

import assert from 'assert'
import sinon from 'sinon'
import {mem, defaultContext} from 'lom_atom'
import Injector from '../src/Injector'
import type {ISheet} from '../src/Injector'

function createSheet(): ISheet<*> {
    return {
        classes: ({}: Object),
        attach: sinon.spy(function () {
            return this
        }),
        detach: sinon.spy(function () {
            return this
        }),
        update: sinon.spy(function () {
            return this
        })
    }
}

describe('Injector.theme', () => {
    it('theme always resolved in top injector', () => {
        function Theme() {
            return {}
        }
        Theme.theme = true
        class A {
            theme: Theme
            static deps = [Theme]
            constructor(t: Theme) {
                this.theme = t
            }
        }

        const parent = new Injector()
        const child = parent.copy()

        const aChild: A = child.value(A)

        assert(parent.value(Theme) === aChild.theme)
    })


    it('theme attached on access', () => {
        function Theme() {
            return {}
        }
        Theme.theme = true
        class A {
            theme: Theme
            static deps = [Theme]
        }

        const sheet = createSheet()

        const inj = new Injector(undefined, {
            createStyleSheet<V: Object>(cssProps: V): ISheet<*> {
                return sheet
            }
        })
        const a: A = inj.value(A)
        inj.value(A)

        assert(sheet.attach.calledOnce)
    })


    it('theme update on dependency changes', () => {
        class B {}
        function Theme(b: B) {
            return {}
        }
        Theme.deps = [B]
        Theme.theme = true
        class A {
            theme: Theme
            static deps = [Theme]
        }

        const sheet = createSheet()
        const inj = new Injector(undefined, {
            createStyleSheet<V: Object>(cssProps: V): ISheet<*> {
                return sheet
            }
        })
        inj.value(A)
        inj.value(B, new B())
        inj.value(A)

        assert(sheet.attach.calledTwice)
        assert(sheet.update.calledOnce)
    })

    it('theme detach on dependency unuse', () => {
        function Theme() { return {} }
        Theme.theme = true
        class A {
            static deps = [Theme]
        }

        class B {}

        class C {
            @mem isA = true
            @mem v() {
                return this.isA ? inj.value(A) : inj.value(B)
            }
        }

        const sheet = createSheet()
        const inj = new Injector(undefined, {
            createStyleSheet<V: Object>(cssProps: V): ISheet<*> {
                return sheet
            }
        })
        const c = new C()
        c.v()
        assert(sheet.attach.calledOnce)
        c.isA = false
        c.v()
        defaultContext.beginTransaction()
        defaultContext.endTransaction()
        assert(sheet.detach.calledOnce)

    })
})