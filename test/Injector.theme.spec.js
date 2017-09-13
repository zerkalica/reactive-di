// @flow

import assert from 'assert'
import sinon from 'sinon'
import {mem, defaultContext} from 'lom_atom'
import Injector from '../src/Injector'
import type {ISheet} from '../src/Injector'


function createSheet(classes?: Object = {}): ISheet<*> {
    return {
        classes,
        attach: sinon.spy(function (orig) {
            return this
        }),
        detach: sinon.spy(function () {
            return this
        }),
        update: sinon.spy(function (name, newClasses) {
            this.classes = newClasses
            return this
        })
    }
}

describe('Injector.theme', () => {
    it('theme always resolved in top injector', () => {
        function Theme() {
            return {a: {}}
        }
        Theme.theme = true
        class A {
            theme: Theme
            static deps = [Theme]
            constructor(t: Theme) {
                this.theme = t
            }
        }

        const sheet = createSheet()
        const parent = new Injector(undefined, {
            createStyleSheet<V: Object>(cssProps: V): ISheet<*> {
                return sheet
            }
        })
        const child = parent.copy()

        const aChild: A = child.value(A)
        const aParent: A = parent.value(A)
        assert(aParent.theme === aChild.theme)
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
        class B {
            @mem v = 1
        }
        function Theme(b: B) {
            return {
                v: b.v
            }
        }

        Theme.deps = [B]
        Theme.theme = true

        function A(t) {
            return t.v
        }
        A._r = [2, [Theme]]

        let sheet = createSheet()
        const inj = new Injector(undefined, {
            createStyleSheet<V: Object>(cssProps: V): ISheet<*> {
                return sheet = createSheet(cssProps)
            }
        })
        assert(inj.invoke(A) === 1)
        inj.value(B).v = 2
        assert(inj.invoke(A) === 2)
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
