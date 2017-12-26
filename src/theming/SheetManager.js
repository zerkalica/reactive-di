// @flow

import type {ISheetManager, ISheetMeta, IAdapter, ISheet, IRemover} from './interfaces'
import DisposableSheet from './DisposableSheet'

export const scheduleNative: (handler: () => void) => number = typeof requestAnimationFrame === 'function'
    ? (handler: () => void) => requestAnimationFrame(handler)
    : (handler: () => void) => setTimeout(handler, 16)

const badClassSymbols = new RegExp('[^\\w\\d]', 'g')

export default class SheetManager<CustomRule> implements IRemover, ISheetManager {
    _adapter: IAdapter<CustomRule>
    _cache: Map<string, DisposableSheet<*, CustomRule>> = new Map()

    _added: (ISheet<*> & CustomRule)[] = []
    _removed: (ISheet<*> & CustomRule)[] = []
    _scheduled = false

    constructor(adapter: IAdapter<CustomRule>) {
        this._adapter = adapter
    }

    sheet<V: Object>(key: string, css: V, memoized: boolean): V {
        let result = memoized ? null : this._cache.get(key)
        if (!result) {
            const sheet = this._adapter.create(css, key.replace(badClassSymbols, ''))
            this._added.push(sheet)
            this._schedule()
            result = new DisposableSheet(key, sheet, this)
            if (!memoized) {
                this._cache.set(key, result)
            }
        }

        return (result: any)
    }

    remove<V>(meta: ISheetMeta<V, CustomRule>) {
        this._cache.delete(meta.key)
        this._removed.push(meta.sheet)
        this._schedule()
    }

    _schedule() {
        if (this._scheduled) return
        this._scheduled = true
        scheduleNative(this._sync)
    }

    _sync = () => {
        this._adapter.sync(this._added, this._removed)
        this._removed = []
        this._added = []
        this._scheduled = false
    }
}
