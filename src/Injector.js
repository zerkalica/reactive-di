// @flow

import {memkey} from 'lom_atom'

export type IArg = Function | {+[id: string]: Function}
export type IProvideItem = Function | Object | [Function, mixed]

export type IPropsWithContext = {
    [id: string]: any;
    __lom_ctx?: Injector;
}

export interface ISheet<V: Object> {
    update(name?: string, props: V): ISheet<V>;
    attach(): ISheet<V>;
    detach(): ISheet<V>;
    classes: {+[id: $Keys<V>]: string};
}

export interface IProcessor {
    createStyleSheet<V: Object>(_cssObj: V, options: any): ISheet<V>;
}

let chainCount = 0

class FakeSheet<V: Object> implements ISheet<V> {
    classes: {+[id: $Keys<V>]: string} = {}

    update(name?: string, props: V): ISheet<V> {
        return this
    }

    attach(): ISheet<V> {
        return this
    }

    detach(): ISheet<V> {
        return this
    }
}

const defaultSheetProcessor: IProcessor = {
    createStyleSheet<V: Object>(cssProps: V): ISheet<V> {
        return new FakeSheet()
    }
}

class SheetManager {
    _sheetProcessor: IProcessor
    _injector: Injector

    constructor(sheetProcessor?: IProcessor, injector: Injector) {
        this._sheetProcessor = sheetProcessor || defaultSheetProcessor
        this._injector = injector
    }

    @memkey
    sheet<V: Object>(key: Function, value?: ISheet<V>, force?: boolean, oldValue?: ISheet<V>): ISheet<V> {
        if (value !== undefined) return value

        if (oldValue === undefined) {
            const newValue: ISheet<V> = this._sheetProcessor.createStyleSheet(this._injector.invoke(key))
            newValue.attach()
            return newValue
        }

        oldValue.update(undefined, this._injector.invoke(key))
        oldValue.attach()
        return oldValue
    }

    _destroyProp(key?: string | Function, value?: ISheet<*>) {
        if (value !== undefined) {
            value.detach()
        }
    }
}

function empty() {}

export default class Injector {
    parent: Injector | void
    displayName: string
    _sheetManager: SheetManager
    _map: WeakMap<Function, any>

    constructor(items?: IProvideItem[], sheetProcessor?: IProcessor | SheetManager, parent?: Injector, displayName?: string) {
        this.parent = parent
        this.displayName = displayName || 'Injector'
        this._sheetManager = sheetProcessor instanceof SheetManager
            ? sheetProcessor
            : new SheetManager(sheetProcessor, this)
        const map = this._map = new WeakMap()
        if (items !== undefined) {
            for (let i = 0; i < items.length; i++) {
                const item = items[i]
                if (item instanceof Array) {
                    map.set(item[0], item[1])
                } else if (typeof item === 'function') {
                    map.set(item, empty)
                } else {
                    map.set(item.constructor, item)
                }
            }
        }
    }

    value<V>(key: Function): V {
        let value = this._map.get(key)
        if (value === undefined) {
            let current = this.parent
            if (current !== undefined) {
                do {
                    value = current._map.get(key)
                    if (value !== undefined) {
                        this._map.set(key, value)
                        return value
                    }
                    current = current.parent
                } while (current !== undefined)
            }

            value = this._fastNew(key)
            this._map.set(key, value)
        } else if (value === empty) {
            value = this._fastNew(key)
            this._map.set(key, value)
        }

        return value
    }

    destroy() {
        this.parent = undefined
        this._sheetManager = (undefined: any)
    }

    _fastNew<V>(key: any): V {
        const args = this.resolve(key.deps)
        switch (args.length) {
            case 0: return new key()
            case 1: return new key(args[0])
            case 2: return new key(args[0], args[1])
            case 3: return new key(args[0], args[1], args[2])
            case 4: return new key(args[0], args[1], args[2], args[3])
            case 5: return new key(args[0], args[1], args[2], args[3], args[4])
            case 6: return new key(args[0], args[1], args[2], args[3], args[4], args[5])
            default: return new key(...args)
        }
    }

    invoke<V>(key: Function): V {
        const args = this.resolve(key.deps)
        switch (args.length) {
            case 0: return key()
            case 1: return key(args[0])
            case 2: return key(args[0], args[1])
            case 3: return key(args[0], args[1], args[2])
            case 4: return key(args[0], args[1], args[2], args[3])
            case 5: return key(args[0], args[1], args[2], args[3], args[4])
            case 6: return key(args[0], args[1], args[2], args[3], args[4], args[5])
            default: return key(...args)
        }
    }

    copy(items?: IProvideItem[], displayName: string): Injector {
        return new Injector(items, this._sheetManager, this, this.displayName + '_' + displayName)
    }

    resolve(argDeps?: IArg[]): any[] {
        const result = []
        const map = this._map
        if (argDeps !== undefined) {
            for (let i = 0, l = argDeps.length; i < l; i++) {
                let argDep = argDeps[i]
                if (typeof argDep === 'object') {
                    const obj = {}
                    for (let prop in argDep) { // eslint-disable-line
                        const key = argDep[prop]
                        obj[prop] = key.theme === undefined
                            ? this.value(key)
                            : this._sheetManager.sheet(key).classes
                    }

                    result.push(obj)
                } else {
                    result.push(argDep.theme === undefined
                        ? this.value(argDep)
                        : this._sheetManager.sheet(argDep).classes
                    )
                }
            }
        }

        return result
    }
}
