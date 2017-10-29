// @flow

import assert from 'assert'
import Injector from '../src/Injector'
import type {ISheet, IProcessor} from '../src/interfaces'
import theme from '../src/theme'

describe('Injector.theme', () => {
    it('lazy attach/detach', () => {
        const css = { main: { color: 'red' } }
        class A {
            @theme get css() {
                return css
            }
        }

        let attached = false

        const sheet: ISheet<any> = {
            classes: ({ main: 'A.main' }: Object),
            attach() {
                attached = true
            }
        }

        let created = null
        let removed = null

        const processor: IProcessor = {
            createStyleSheet(css, opts) {
                created = css
                return sheet
            },
            removeStyleSheet(sheet) {
                removed = sheet
            }
        }

        const parent = new Injector(undefined, processor)
        const aParent: A = parent.value(A)

        assert(attached === false)
        assert(created === null)

        assert(aParent.css.main === sheet.classes.main)
        assert(attached === true)
        assert(created === css)

        ;(aParent.css: Object).destructor()
        assert(removed === sheet)

        attached = false
        created = null
        assert(aParent.css.main === sheet.classes.main)
        assert(attached === true)
        assert(created === css)
    })

    it('one instance', () => {
        const css = { main: { color: 'red' } }
        class A {
            @theme get css() {
                return css
            }
        }

        const sheet: ISheet<any> = {
            classes: ({ main: 'A.main' }: Object),
            attach() {}
        }

        const processor: IProcessor = {
            createStyleSheet(css, opts) {
                return sheet
            },
            removeStyleSheet() {}
        }

        const parent = new Injector(undefined, processor)
        const a1: A = parent.copy('child1').value(A)
        const a2: A = parent.copy('child2').value(A)

        assert(a1.css === a2.css)
    })

    it('multiple instances', () => {
        const css = { main: { color: 'red' } }
        class A {
            @theme.self get css() {
                return css
            }
        }

        const sheet: ISheet<any> = {
            classes: ({ main: 'A.main' }: Object),
            attach() {}
        }

        const processor: IProcessor = {
            createStyleSheet(css, opts) {
                return sheet
            },
            removeStyleSheet() {}
        }

        const parent = new Injector(undefined, processor)
        const a1: A = parent.copy('child1', 0).value(A)
        const a2: A = parent.copy('child2', 1).value(A)
        assert(a1.css !== a2.css)
    })
})
