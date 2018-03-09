// @flow

import type {IArg, IProvideItem, IPropsWithContext} from './interfaces'
import {rdiInst, rdiProp} from './interfaces'
import type {ISheetManager, ISheet} from './theming/interfaces'
type IListener = Object

type ICache = {[id: string]: any}

let depId = 0
const rdiId = Symbol('rdi_id')
class Alias<T: Function> {
    dest: T
    constructor(dest: T) {
        dest[rdiId] = '' + ++depId
        this.dest = dest
    }
}

type IState = {[ns: string]: {[id: string]: any}}

export interface IInjectorFlags {
    displayName: string;
    instance?: number;
    isDynamic?: boolean;
    contextAliases?: IProvideItem[];
}
export default class Injector {
    displayName: string
    instance: number

    static parentContext: Injector
    static sheetManager: ISheetManager

    _flags: IInjectorFlags | void
    _cache: ICache
    _state: IState | void

    id = ''
    props: {
        class?: string;
        style?: Object;
    } | void = undefined

    constructor(
        contextAliases?: IProvideItem[],
        sheetManager?: ?ISheetManager,
        state?: IState,
        displayName?: string,
        instance?: number,
        cache?: ICache,
        flags?: IInjectorFlags
    ) {
        this._state = state
        this.instance = instance || 0
        this.displayName = displayName || ''
        if (Injector.parentContext === undefined) Injector.parentContext = this
        if (sheetManager) {
            Injector.sheetManager = sheetManager
        }
        this._flags = flags

        const map = this._cache = cache || (Object.create(null): Object)
        if (contextAliases !== undefined) {
            for (let i = 0; i < contextAliases.length; i++) {
                const item = contextAliases[i]
                if (item instanceof Array) {
                    const src: string | Function = item[0]
                    if (typeof src === 'string') {
                        map[src] = item[1]
                    } else {
                        if (src[rdiId] === undefined) {
                            src[rdiId] = '' + ++depId
                        }
                        const dest = item[1]
                        map[src[rdiId]] = typeof dest === 'function' && !(dest instanceof Alias)
                            ? new Alias(dest)
                            : dest
                    }
                } else {
                    const src = item.constructor
                    if (src[rdiId] === undefined) {
                        src[rdiId] = '' + ++depId
                    }
                    map[src[rdiId]] = item
                }
            }
        }
    }

    _sheet: ISheet | void = undefined
    getClassName<V: {_dynamic?: boolean}>(data: V, debugName?: string): string {
        let sheet = this._sheet
        const flags = this._flags
        if (sheet === undefined) {
            sheet = this._sheet = Injector.sheetManager.createSheet(
                this.displayName + (flags && flags.isDynamic ? ('_' + this.instance) : '' )
            )
        }
        if (data._dynamic !== undefined && flags) {
            flags.isDynamic = true
        }

        return sheet.addRule(data, debugName)
    }

    toString() {
        return this.displayName + (this.instance ? ('[' + this.instance + ']') : '')
    }

    toJSON() {
        return this._cache
    }

    value<V>(key: Function): V {
        let id: string = key[rdiId]
        if (key[rdiId] === undefined) {
            id = key[rdiId] = '' + ++depId
        }
        let value = this._cache[id]

        if (value === undefined) {
            value = this._cache[id] = this.invoke(key)
            const depName = (key.displayName || key.name) + (this.instance > 0 ? ('[' + this.instance + ']') : '')
            value.displayName = `${this.displayName}.${depName}`
            value[rdiInst] = this
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

    destructor() {
        if (this._sheet) this._sheet.destructor()
        this._sheet = undefined
        this._cache = (undefined: any)
        this._listeners = undefined
    }

    invoke<V>(key: any): V {
        let isFn = false
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
            id = key[rdiId]
            if (id === undefined) {
                id = key[rdiId] = '' + ++depId
            }
        }
        const newKey = this._cache[id]
        if (newKey instanceof Alias) return newKey.dest
        if (newKey === undefined) return key

        return newKey
    }

    getContext<Context, Props>(key: Function, props?: Props): Context {
        const deps =  key.deps || (key._r === undefined ? undefined : key._r[1])
        if (deps === undefined) return (undefined: any)
        const a = this.resolve(deps)
        const listeners = this._listeners
        if (props !== undefined && listeners !== undefined) {
            for (let i = 0; i < listeners.length; i++) {
                const listener = listeners[i]
                listener[listener.constructor[rdiProp]] = props
            }
        }
        this._resolved = true
        return a[0]
    }

    copy(flags: IInjectorFlags): Injector {
        return new Injector(
            flags.contextAliases,
            null,
            this._state,
            flags.displayName,
            flags.instance,
            Object.create(this._cache),
            flags
        )
    }

    resolve(argDeps?: IArg[]): any[] {
        const result = []
        if (argDeps === undefined) return result
        let listeners = this._listeners
        const resolved = this._resolved
        for (let i = 0, l = argDeps.length; i < l; i++) {
            let argDep = argDeps[i]
            if (typeof argDep === 'object') {
                const obj = {}
                for (let prop in argDep) { // eslint-disable-line
                    const key = argDep[prop]
                    const dep = this.value(key)
                    if (resolved === false && key[rdiProp] !== undefined) {
                        if (listeners === undefined) {
                            this._listeners = listeners = []
                        }
                        listeners.push(dep)
                    }

                    obj[prop] = dep
                }

                result.push(obj)
            } else {
                const dep = this.value(argDep)
                if (resolved === false && argDep[rdiProp] !== undefined) {
                    if (listeners === undefined) {
                        this._listeners = listeners = []
                    }
                    listeners.push(dep)
                }

                result.push(dep)
            }
        }

        return result
    }
}
