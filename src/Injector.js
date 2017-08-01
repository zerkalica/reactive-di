// @flow

import {mem, memkey} from 'lom_atom'

export type IArg = Function | {[id: string]: Function}
export type IProvideItem = Function | [Function, Function]

export type IPropsWithContext = {
    [id: string]: any;
    __lom_ctx?: Injector;
}

export interface ISheet<V: Object> {
    attach(): ISheet<V>;
    detach(): ISheet<V>;
    classes: {+[id: $Keys<V>]: string};
}

export interface IProcessor {
    createStyleSheet<V: Object>(_cssObj: V, options: any): ISheet<V>;
}

let chainCount = 0

const defaultSheetProcessor: IProcessor = {
    createStyleSheet<V: Object>(cssProps: V): ISheet<*> {
        return {
            attach() {
                return this
            },
            detach() {
                return this
            },
            classes: ({}: Object)
        }
    }
}

export default class Injector {
    map: Map<Function, *>
    parent: Injector | void
    top: Injector
    _sheetProcessor: IProcessor

    constructor(parent?: Injector, items?: IProvideItem[], sheetProcessor?: IProcessor) {
        this.parent = parent
        this.top = parent ? parent.top : this
        this._sheetProcessor = sheetProcessor || defaultSheetProcessor
        if (items !== undefined) {
            for (let i = 0; i < items.length; i++) {
                const item = items[i]
                if (item instanceof Array) {
                    this.value(item[0], item[1], true)
                } else if (typeof item === 'function') {
                    this.value(item, null, true)
                } else {
                    this.value(item.constructor, item, true)
                }
            }
        }
    }

    @memkey
    value<V>(key: Function, next?: V, force?: boolean): V | void {
        if (next !== undefined) return next

        if (key.theme === true) {
            if (this.top === this) {
                const sheet = this._sheetProcessor.createStyleSheet(this.instance(key))
                sheet.attach()
                return (sheet: any)
            }
            return this.top.value(key)
        }

        if (this.parent !== undefined) {
            chainCount++
            const value: V | void = this.parent.value(key)
            chainCount--
            if (value !== undefined) {
                return value
            }
        }
        if (chainCount === 0) {
            return this.instance(key)
        }
    }

    _destroy() {
        this.parent = undefined
        this.map = (undefined: any)
        this.top = (undefined: any)
        this._sheetProcessor = (undefined: any)
    }

    _fastCall<V>(key: any, args: mixed[]): V {
        switch (args.length) {
            case 1: return new key(args[0])
            case 2: return new key(args[0], args[1])
            case 3: return new key(args[0], args[1], args[2])
            case 4: return new key(args[0], args[1], args[2], args[3])
            case 5: return new key(args[0], args[1], args[2], args[3], args[4])
            default: return new key(...args)
        }
    }

    instance<V>(key: Function): V {
        return this._fastCall(key, this.resolve(key.deps))
    }

    copy(items?: IProvideItem[]): Injector {
        return new Injector(this, items, this._sheetProcessor)
    }

    resolve(argDeps?: IArg[], acc?: {sheet: ISheet<*> | void}): any[] {
        const result = []
        if (argDeps !== undefined) {
            for (let i = 0, l = argDeps.length; i < l; i++) {
                let argDep = argDeps[i]
                if (typeof argDep === 'object') {
                    const obj = {}
                    for (let prop in argDep) { // eslint-disable-line
                        const key = argDep[prop]
                        if (key.theme === undefined) {
                            obj[prop] = this.value(key)
                        } else if (acc !== undefined) {
                            acc.sheet = ((this.value(key): any): ISheet<*>)
                            obj[prop] = acc.sheet.classes
                        }
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
