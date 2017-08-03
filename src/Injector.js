// @flow

import {mem, memkey} from 'lom_atom'

export type IArg = Function | {+[id: string]: Function}
export type IProvideItem = Function | Object | [Function, mixed]

export type IPropsWithContext = {
    [id: string]: any;
    __lom_ctx?: Injector;
}

export interface ISheet<V: Object> {
    update(props: V): ISheet<V>;
    attach(): ISheet<V>;
    detach(): ISheet<V>;
    classes: {+[id: $Keys<V>]: string};
}

export interface IProcessor {
    createStyleSheet<V: Object>(_cssObj: V, options: any): ISheet<V>;
}

let chainCount = 0

class FakeSheet<V> implements ISheet<V> {
    classes: Object = {}

    update(props: V) {
        return this
    }

    attach() {
        return this
    }

    detach() {
        return this
    }
}

const defaultSheetProcessor: IProcessor = {
    createStyleSheet<V: Object>(cssProps: V): ISheet<*> {
        return new FakeSheet()
    }
}

export default class Injector {
    parent: Injector | void
    top: Injector
    _sheetProcessor: IProcessor
    _sticky: Set<Function> | void

    constructor(items?: IProvideItem[], sheetProcessor?: IProcessor, parent?: Injector) {
        this.parent = parent
        this.top = parent ? parent.top : this
        this._sheetProcessor = sheetProcessor || defaultSheetProcessor
        this._sticky = undefined
        if (items !== undefined) {
            for (let i = 0; i < items.length; i++) {
                const item = items[i]
                if (item instanceof Array) {
                    this.value(item[0], item[1], true)
                } else if (typeof item === 'function') {
                    if (this._sticky === undefined) {
                        this._sticky = new Set()
                    }
                    this._sticky.add(item)
                } else {
                    this.value(item.constructor, item, true)
                }
            }
        }
    }

    @memkey
    value<V>(key: Function, next?: V, force?: boolean, oldValue?: V): V {
        if (next !== undefined) return next

        if (key.theme === true) {
            if (this.top === this) {
                const sheet = oldValue === undefined
                    ? this._sheetProcessor.createStyleSheet(this._fastCall(key))
                    : (oldValue: any).update(this._fastCall(key))
                sheet.attach()
                return (sheet: any)
            }
            return this.top.value(key)
        }

        if (this.parent !== undefined && (this._sticky === undefined || !this._sticky.has(key))) {
            chainCount++
            const value: V | void = this.parent.value(key)
            chainCount--
            if (value !== undefined) {
                return value
            }
        }
        if (chainCount === 0) {
            return this._fastNew(key)
        }

        return (undefined: any)
    }

    _destroyProp(key?: string | Function, value?: mixed) {
        if (typeof key === 'function' && key.theme !== undefined && value !== undefined) {
            (value: any).detach()
            return
        }
    }

    _destroy() {
        this._sticky = undefined
        this.parent = undefined
        this.top = (undefined: any)
        this._sheetProcessor = (undefined: any)
    }

    _fastNew<V>(key: any): V {
        const args = this.resolve(key.deps)
        switch (args.length) {
            case 1: return new key(args[0])
            case 2: return new key(args[0], args[1])
            case 3: return new key(args[0], args[1], args[2])
            case 4: return new key(args[0], args[1], args[2], args[3])
            case 5: return new key(args[0], args[1], args[2], args[3], args[4])
            case 6: return new key(args[0], args[1], args[2], args[3], args[4], args[5])
            default: return new key(...args)
        }
    }

    _fastCall<V>(key: Function): V {
        const args = this.resolve(key.deps)
        switch (args.length) {
            case 1: return key(args[0])
            case 2: return key(args[0], args[1])
            case 3: return key(args[0], args[1], args[2])
            case 4: return key(args[0], args[1], args[2], args[3])
            case 5: return key(args[0], args[1], args[2], args[3], args[4])
            case 6: return key(args[0], args[1], args[2], args[3], args[4], args[5])
            default: return key(...args)
        }
    }

    copy(items?: IProvideItem[]): Injector {
        return new Injector(items, this._sheetProcessor, this)
    }

    resolve(argDeps?: IArg[]): any[] {
        const result = []
        if (argDeps !== undefined) {
            for (let i = 0, l = argDeps.length; i < l; i++) {
                let argDep = argDeps[i]
                if (typeof argDep === 'object') {
                    const obj = {}
                    for (let prop in argDep) { // eslint-disable-line
                        const key = argDep[prop]
                        obj[prop] = key.theme === undefined
                            ? this.value(key)
                            : ((this.value(key): any): ISheet<*>).classes
                    }
                    result.push(obj)
                } else {
                    result.push(this.value(argDep))
                }
            }
        }

        return result
    }
}
