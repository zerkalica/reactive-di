// @flow

export type CssObj = Object

export interface RawStyleSheet {
    __css: CssObj;
}

export interface StyleSheet {
    classes: {[id: string]: string};
    attach(): void;
    detach(): void;
}

export interface SheetFactory {
    createStyleSheet(_cssObj: CssObj): StyleSheet;
}

export class AbstractSheetFactory {
    static _rdiAbs = true
    static _rdiKey = 'AbstractSheetFactory'

    createStyleSheet(_cssObj: CssObj): StyleSheet {
        throw new Error('implement')
    }
}
