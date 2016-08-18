// @flow

import type {StyleSheet} from './interfaces/component'

export default class StyleAttachOptimizer {
    _sheet: StyleSheet
    _counter: number
    _hasStyles: boolean

    classes: {[id: string]: string};

    constructor(sheet: StyleSheet) {
        this._sheet = sheet
        this._counter = 0
        this.classes = sheet.classes
        this._hasStyles = Object.keys(sheet.classes).length > 0
    }

    attach(): void {
        if (!this._hasStyles) {
            return
        }
        if (this._counter === 0) {
            this._sheet.attach()
        }
        this._counter++
    }

    detach(): void {
        if (!this._hasStyles) {
            return
        }
        if (this._counter > 0) {
            this._counter--
        } else {
            this._sheet.detach()
        }
    }
}
