//@flow

import {DepInfo, ThemeMeta, IHandler} from 'reactive-di/core/common'
import type {IContext} from 'reactive-di/interfaces/internal'
import type {Atom, Derivable} from 'reactive-di/interfaces/atom'
import type {StyleSheet, CreateStyleSheet, RawStyleSheet} from 'reactive-di/interfaces/component'
import {fastCreateObject} from 'reactive-di/utils/fastCall'

function noop() {}
const fakeStyles: StyleSheet = {
    attach: noop,
    detach: noop,
    classes: {}
}

export default class ThemeHandler {
    _createSheet: CreateStyleSheet

    constructor(
        createSheet: CreateStyleSheet
    ) {
        this._createSheet = createSheet
    }

    handle<V>(di: DepInfo<V, ThemeMeta>): Atom<V> {
        const {
            deps,
            target,
            ctx
        } = di
        const depsAtom: Derivable<mixed[]> = ctx.resolveDeps(deps)
        const createTheme = (args: mixed[]) => this._createTheme(args, di)

        return (depsAtom.derive(createTheme): any)
    }

    _createTheme(deps: mixed[], di: DepInfo<any, ThemeMeta>): RawStyleSheet {
        const {
            target,
            ctx
        } = di
        const theme: RawStyleSheet = fastCreateObject(target, deps)
        if (!theme.__css) {
            throw new Error(`Provide this.__css property with jss styles in theme ${ctx.debugStr(theme)}`)
        }
        const styles: StyleSheet = this._createSheet(theme.__css)
        theme.__styles = Object.keys(styles.classes).length > 0 ? styles : fakeStyles
        Object.assign(theme, styles.classes)

        return ctx.preprocess(theme, di)
    }
}

if (0) ((new ThemeHandler(...(0: any))): IHandler)
