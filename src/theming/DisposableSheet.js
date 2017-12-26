// @flow

import type {ISheetMeta, ISheet, IRemover} from './interfaces'

const metaId = Symbol('rdi_theme')

export default class DisposableSheet<V: Object, CustomRule> {
    constructor(key: string, sheet: ISheet<V> & CustomRule, remover: IRemover) {
        ;(this: Object)[metaId] = {
            remover,
            key,
            sheet
        }
        if (sheet.classes.destructor) {
            throw new Error(`Rename property name in ${key} result`)
        }
        Object.assign(this, sheet.classes)
    }

    destructor() {
        const meta: ISheetMeta<V, CustomRule> = (this: Object)[metaId]
        meta.remover.remove(meta)
    }
}
