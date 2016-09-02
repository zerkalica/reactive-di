//@flow

import {DepInfo, ThemeMeta, IHandler, IContext} from '../common'
import type {Atom, Adapter, CacheMap, Derivable} from '../../interfaces/atom'
import type {CreateWidget, StyleSheet, CreateStyleSheet, RawStyleSheet} from '../../interfaces/component'
import {fastCreateObject} from '../../utils/fastCall'

class StyleAttachOptimizer {
    _sheet: StyleSheet
    _hasStyles: boolean

    classes: {[id: string]: string};

    constructor(sheet: StyleSheet) {
        this._sheet = sheet
        this.classes = sheet.classes
        this._hasStyles = Object.keys(sheet.classes).length > 0
    }

    attach(): void {
        if (!this._hasStyles) {
            return
        }
        this._sheet.attach()
    }

    detach(): void {
        if (!this._hasStyles) {
            return
        }
        this._sheet.detach()
    }
}

export default class ThemeHandler {
    _createSheet: CreateStyleSheet

    constructor(
        createSheet: CreateStyleSheet
    ) {
        this._createSheet = createSheet
    }

    handle({
        deps,
        target,
        ctx
    }: DepInfo<ThemeMeta>): Derivable<RawStyleSheet> {
        const depsAtom: Derivable<mixed[]> = ctx.resolveDeps(deps)
        const createTheme = (args: mixed[]) => this._createTheme(target, args, ctx)

        return depsAtom.derive(createTheme)
    }

    _createTheme(target: Class<RawStyleSheet>, deps: mixed[], ctx: IContext): RawStyleSheet {
        const theme: RawStyleSheet = fastCreateObject(target, deps)
        if (!theme.__css) {
            throw new Error(`Provide this.__css property with jss styles in theme ${ctx.debugStr(theme)}`)
        }
        const styles: StyleSheet = this._createSheet(theme.__css)
        theme.__styles = new StyleAttachOptimizer(styles)
        Object.assign(theme, styles.classes)

        return ctx.preprocess(theme)
    }

    postHandle(): void {}
}

if (0) ((new ThemeHandler(...(0: any))): IHandler<ThemeMeta, Derivable<RawStyleSheet>>)
