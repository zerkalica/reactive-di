// @flow

export type CssObj = Object

export interface RawStyleSheet {
    __css: CssObj;
}

export type StyleSheet = {
    classes: {[id: string]: string};
    attach(): StyleSheet;
    detach(): StyleSheet;
}

export interface SheetFactory {
    createStyleSheet(_cssObj: CssObj, options: any): StyleSheet;
}

export class AbstractSheetFactory {
    static _rdiAbs = true
    static _rdiKey = 'AbstractSheetFactory'
    static _rdiInst = true

    createStyleSheet(_cssObj: CssObj): StyleSheet {
        throw new Error('implement')
    }
}
