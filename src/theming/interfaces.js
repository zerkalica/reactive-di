// @flow

export interface ISheet {
    addRule<V: Object>(css: V, debugName?: string): string;
    destructor(): void;
}

export interface ISheetManager {
    createSheet(sheetKey: string): ISheet;
}
