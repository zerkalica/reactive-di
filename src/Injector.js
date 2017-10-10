// @flow

import {memkey} from 'lom_atom'

export type IArg = Function | {+[id: string]: Function}
export type IProvideItem = Function | Object | [Function | string, Function | mixed]

export type IPropsWithContext = {
    [id: string]: any;
    __lom_ctx?: Injector;
}

export interface ISheet<V: Object> {
    // update(props: V): ISheet<V>;
    attach(): ISheet<V>;
    detach(): ISheet<V>;
    classes: {+[id: $Keys<V>]: string};
}

export interface IProcessor {
    createStyleSheet<V: Object>(_cssObj: V, options: any): ISheet<V>;
    removeStyleSheet<V: Object>(sheet: ISheet<V>): void;
}

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
    },
    removeStyleSheet<V: Object>(sheet: ISheet<V>) {}
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

        if (oldValue !== undefined) {
            this._sheetProcessor.removeStyleSheet(oldValue)
            // oldValue.detach()
        }
        const newValue: ISheet<V> = this._sheetProcessor.createStyleSheet(this._injector.invoke(key))
        newValue.attach()

        return newValue
    }

    destroy(value: ISheet<*>) {
        this._sheetProcessor.removeStyleSheet(value)
        // value.detach()
    }
}

type IListener = Object

type ICache = {[id: string]: any}

let depId = 0

class Alias<T: Function> {
    dest: T
    constructor(dest: T) {
        dest.__rdi_id = '' + ++depId
        this.dest = dest
    }
}

type IState = {[ns: string]: {[id: string]: any}}

export default class Injector {
    displayName: string
    _sheetManager: SheetManager
    _cache: ICache
    _instance: number
    _state: IState | void

    constructor(
        items?: IProvideItem[],
        sheetProcessor?: IProcessor | SheetManager,
        state?: IState,
        displayName?: string,
        instance?: number,
        cache?: ICache
    ) {
        this._state = state
        this._instance = instance || 0
        this.displayName = displayName || '$'
        this._sheetManager = sheetProcessor instanceof SheetManager
            ? sheetProcessor
            : new SheetManager(sheetProcessor, this)

        const map = this._cache = cache || (Object.create(null): Object)
        if (items !== undefined) {
            for (let i = 0; i < items.length; i++) {
                const item = items[i]
                if (item instanceof Array) {
                    const src: string | Function = item[0]
                    if (typeof src === 'string') {
                        map[src] = item[1]
                    } else {
                        if (src.__rdi_id === undefined) {
                            src.__rdi_id = '' + ++depId
                        }
                        const dest = item[1]
                        map[src.__rdi_id] = typeof dest === 'function' && !(dest instanceof Alias)
                            ? new Alias(dest)
                            : dest
                    }
                } else {
                    const src = item.constructor
                    if (src.__rdi_id === undefined) {
                        src.__rdi_id = '' + ++depId
                    }
                    map[src.__rdi_id] = item
                }
            }
        }
    }

    toString() {
        return this.displayName
    }

    toJSON() {
        return this._cache
    }

    value<V>(key: Function): V {
        let id: string = key.__rdi_id
        if (key.__rdi_id === undefined) {
            id = key.__rdi_id = '' + ++depId
        }
        let value = this._cache[id]

        if (value === undefined) {
            value = this._cache[id] = this.invoke(key)
            const depName = (key.displayName || key.name) + (this._instance > 0 ? ('[' + this._instance + ']') : '')
            value.displayName = `${this.displayName}.${depName}`
            const state = this._state === undefined ? undefined : this._state[depName]
            if (state && typeof state === 'object') {
                for (let prop in state) {
                    ;(value: Object)[prop] = state[prop]
                }
            }
        } else if (value instanceof Alias) {
            value = this._cache[id] = this.value(value.dest)
        }

        return value
    }

    destroy() {
        this._cache = (undefined: any)
        this._listeners = undefined
        this._sheetManager = (undefined: any)
    }

    invoke<V>(key: any): V {
        let isFn = key.theme
        let deps: IArg[] | void = key.deps
        if (key._r !== undefined) {
            isFn = key._r[0] === 2
            deps = deps || key._r[1]
        }

        const a = this.resolve(deps)
        if (isFn) {
            switch (a.length) {
                case 0: return key()
                case 1: return key(a[0])
                case 2: return key(a[0], a[1])
                case 3: return key(a[0], a[1], a[2])
                case 4: return key(a[0], a[1], a[2], a[3])
                case 5: return key(a[0], a[1], a[2], a[3], a[4])
                case 6: return key(a[0], a[1], a[2], a[3], a[4], a[5])
                default: return key(...a)
            }
        }

        switch (a.length) {
            case 0: return new key()
            case 1: return new key(a[0])
            case 2: return new key(a[0], a[1])
            case 3: return new key(a[0], a[1], a[2])
            case 4: return new key(a[0], a[1], a[2], a[3])
            case 5: return new key(a[0], a[1], a[2], a[3], a[4])
            case 6: return new key(a[0], a[1], a[2], a[3], a[4], a[5])
            default: return new key(...a)
        }
    }

    _resolved: boolean = false
    _listeners: IListener[] | void = undefined

    alias(key: Function, rawId?: string): Function {
        let id: string | void = rawId
        if (id === undefined) {
            id = key.__rdi_id
            if (id === undefined) {
                id = key.__rdi_id = '' + ++depId
            }
        }
        const newKey = this._cache[id]
        if (newKey instanceof Alias) return newKey.dest
        if (newKey === undefined) return key

        return newKey
    }

    invokeWithProps<V>(key: Function, props?: Object, propsChanged?: boolean): V {
        const deps =  key.deps || (key._r === undefined ? undefined : key._r[1])
        if (deps === undefined) {
            return key(props)
        }
        const a = this.resolve(deps)
        if (propsChanged === true) {
            const listeners = this._listeners
            if (listeners !== undefined) {
                for (let i = 0; i < listeners.length; i++) {
                    const listener = listeners[i]
                    listener[listener.constructor.__lom_prop] = props
                }
            }
        }
        this._resolved = true
        switch (a.length) {
            case 0: return key(props)
            case 1: return key(props, a[0])
            case 2: return key(props, a[0], a[1])
            case 3: return key(props, a[0], a[1], a[2])
            case 4: return key(props, a[0], a[1], a[2], a[3])
            case 5: return key(props, a[0], a[1], a[2], a[3], a[4])
            case 6: return key(props, a[0], a[1], a[2], a[3], a[4], a[5])
            case 7: return key(props, a[0], a[1], a[2], a[3], a[4], a[5], a[6])
            default: return key(props, ...a)
        }
    }

    copy(items?: IProvideItem[], displayName: string, instance?: number): Injector {
        return new Injector(
            items,
            this._sheetManager,
            this._state,
            this.displayName + '.' + displayName,
            instance,
            Object.create(this._cache)
        )
    }

    resolve(argDeps?: IArg[]): any[] {
        const result = []
        const map = this._cache
        if (argDeps !== undefined) {
            const sm = this._sheetManager
            const resolved = this._resolved
            for (let i = 0, l = argDeps.length; i < l; i++) {
                let argDep = argDeps[i]
                if (typeof argDep === 'object') {
                    const obj = {}
                    if (!resolved) {
                        for (let prop in argDep) { // eslint-disable-line
                            const key = argDep[prop]
                            if (key.theme !== undefined) {
                                obj[prop] = sm.sheet(key).classes
                            }
                        }
                    }

                    for (let prop in argDep) { // eslint-disable-line
                        const key = argDep[prop]
                        const dep = key.theme === undefined
                            ? this.value(key)
                            : sm.sheet(key).classes

                        if (resolved === false && key.__lom_prop !== undefined) {
                            if (this._listeners === undefined) {
                                this._listeners = []
                            }
                            this._listeners.push(dep)
                        }

                        obj[prop] = dep
                    }

                    result.push(obj)
                } else {
                    const dep = argDep.theme === undefined
                        ? this.value(argDep)
                        : sm.sheet(argDep).classes

                    if (resolved === false && argDep.__lom_prop !== undefined) {
                        if (this._listeners === undefined) {
                            this._listeners = []
                        }
                        this._listeners.push(dep)
                    }

                    result.push(dep)
                }
            }
        }

        return result
    }
}
