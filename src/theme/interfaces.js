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
    static displayName = 'AbstractSheetFactory'
    static _r2 = 32 + 128 // abstract + instance

    createStyleSheet(_cssObj: CssObj): StyleSheet {
        throw new Error('implement')
    }
}
