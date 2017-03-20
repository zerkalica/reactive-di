// @flow

import type {StyleSheet, RawStyleSheet} from './interfaces'
import {AbstractSheetFactory} from './interfaces'

export default class GenericThemeHook {
    _sheet: ?StyleSheet
    _sheetFactory: AbstractSheetFactory

    static _r1 = [AbstractSheetFactory]

    constructor(sheetFactory: AbstractSheetFactory) {
        this._sheetFactory = sheetFactory
    }

    merge(rawStyle: RawStyleSheet, _oldSheet: ?RawStyleSheet): ?RawStyleSheet {
        if (this._sheet) {
            this._sheet.detach()
        }
        const css = rawStyle.__css
        if (css && Object.keys(css).length) {
            const sheet = this._sheet = this._sheetFactory.createStyleSheet(css)
            sheet.attach()
            Object.assign(rawStyle, sheet.classes)
        }

        return rawStyle
    }
}
