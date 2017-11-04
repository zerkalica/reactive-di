// @flow

import type {IProcessor, ISheet, ISheetManager, IDisposableSheet} from './interfaces'

interface IRemover {
    remove(sheet: DisposableSheet<any>): void;
}

class DisposableSheet<V: Object> {
    __lom_remover: IRemover
    __lom_sheet: ISheet<V>
    __lom_key: string

    constructor(key: string, sheet: ISheet<V>, remover: IRemover) {
        this.__lom_key = key
        this.__lom_sheet = sheet
        this.__lom_remover = remover
        if (sheet.classes.destructor) {
            throw new Error(`Rename property name in ${key} result`)
        }
        Object.assign((this: Object), sheet.classes)
    }

    destructor() {
        this.__lom_remover.remove(this)
    }
}

export default class SheetManager implements IRemover, ISheetManager {
    _sheetProcessor: IProcessor
    _cache: Map<string, DisposableSheet<any>> = new Map()

    constructor(sheetProcessor: IProcessor) {
        this._sheetProcessor = sheetProcessor
    }

    sheet<V: Object>(key: string, css: V, memoized: boolean): IDisposableSheet<V> {
        let result: ?DisposableSheet<V> = memoized ? null : this._cache.get(key)
        if (!result) {
            const sheet: ISheet<V> = this._sheetProcessor.createStyleSheet(css)
            sheet.attach()
            result = (new DisposableSheet(key, sheet, this))
            if (!memoized) {
                this._cache.set(key, result)
            }
        }

        return (result: Object)
    }

    remove(sheet: DisposableSheet<*>) {
        this._cache.delete(sheet.__lom_key)
        this._sheetProcessor.removeStyleSheet(sheet.__lom_sheet)
    }
}
