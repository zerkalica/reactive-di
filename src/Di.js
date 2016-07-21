// @flow

import {paramTypesKey, metaKey, RdiMeta} from './annotations'
import type {DepFn, Key, Initializer, RegisterDepItem, DepAlias, ArgDep, InitData} from './interfaces/deps'
import type {CreateWidget, StyleSheet, CreateStyleSheet, RawStyleSheet} from './interfaces/component'
import type {Adapter, Atom, Derivable, DerivableArg, DerivableDict} from './interfaces/atom'
import debugName from './utils/debugName'
import {fastCallMethod, fastCall, fastCreateObject} from './utils/fastCall'
import derivableAtomAdapter from './adapters/derivableAtomAdapter'
import createThemesReactor from './createThemesReactor'

function passAny<V>(v: V): V {
    return v
}

function pass<V: Function>(target: V, depsAtom: Derivable<V>): V {
    return target(depsAtom)
}

type CacheMap = Map<Function|string, Derivable<any>>

type Meta = [Function, ArgDep[], RdiMeta<*>]

const defaultMeta: RdiMeta<*> = new RdiMeta()

function metaFromTarget(target: Function): Meta {
    return [
        target,
        target[paramTypesKey] || [],
        target[metaKey] || defaultMeta
    ]
}

type Result<V> = Derivable<V> | Atom<V>

export default class Di {
    _cache: CacheMap;
    _componentCache: CacheMap;

    _scopeMap: Map<Key, Di>;
    _childScopeMap: Map<Key, Di>;
    _metaMap: Map<Key, Meta>;

    _adapter: Adapter;
    _createComponent: CreateWidget<*, *, *>;

    _registered: RegisterDepItem[];
    _values: {[id: string]: any};

    _stopped: Atom<boolean>;

    _createSheet: CreateStyleSheet;

    constructor(
        createComponent?: CreateWidget<*, *, *> = pass,
        createSheet: CreateStyleSheet = passAny,
        adapter?: Adapter = derivableAtomAdapter,
        _scopeMap?: Map<Key, Di> = new Map(),
        _componentCache?: CacheMap = new Map(),
        _metaMap?: Map<Key, Meta> = new Map()
    ) {
        this._adapter = adapter
        this._createSheet = createSheet
        this._cache = new Map()
        this._componentCache = _componentCache
        this._values = {}
        this._createComponent = createComponent
        this._registered = []
        this._scopeMap = _scopeMap
        this._metaMap = _metaMap
        this._childScopeMap = new Map(this._scopeMap)
        this._stopped = adapter.atom(false)
    }

    stop(): Di {
        this._stopped.set(true)
        return this
    }

    values(values?: ?{[id: string]: mixed}): Di {
        this._values = values || {}
        return this
    }

    register(registered?: ?RegisterDepItem[]): Di {
        if (!registered) {
            return this
        }

        const childScopeMap = this._childScopeMap
        const metaMap = this._metaMap
        for (let i = 0, l = registered.length; i < l; i++) {
            const pr: RegisterDepItem = registered[i]
            if (Array.isArray(pr)) {
                if (pr.length !== 2) {
                    throw new Error(`Provide tuple of two items in register() ${this._debugStr(pr)}`)
                }
                childScopeMap.set(pr[0], this)
                if (typeof pr[1] === 'function') {
                    metaMap.set(pr[0], metaFromTarget(pr[1]))
                } else {
                    throw new Error(`Only function as register target, given: ${this._debugStr(pr[1])}`)
                }
            } else {
                childScopeMap.set(pr, this)
                if (typeof pr !== 'function') {
                    throw new Error(`Only function as register target, given: ${this._debugStr(pr)}`)
                }
                metaMap.set(pr, metaFromTarget(pr))
            }
        }

        return this
    }

    create(): Di {
        return (new Di(
            this._createComponent,
            this._createSheet,
            this._adapter,
            this._childScopeMap,
            this._componentCache,
            new Map(this._metaMap)
        )).values(this._values)
    }

    _resolveDeps(deps: ArgDep[], _themes?: ?Derivable<RawStyleSheet>[]): Derivable<any> {
        const resolvedArgs: DerivableArg[] = []
        for (let i = 0, l = deps.length; i < l; i++) {
            const argDep: ArgDep = deps[i]
            if (typeof argDep === 'object') {
                const result: DerivableDict = {}
                for (let prop in argDep) {
                    result[prop] = this.val(argDep[prop], _themes)
                }
                resolvedArgs.push(result)
            } else {
                resolvedArgs.push(this.val(argDep, _themes))
            }
        }

        return this._adapter.struct(resolvedArgs)
    }

    _path: string[] = [];

    _debugStr(sub: ?mixed): string {
        return `${debugName(sub)} [${this._path.join('.')}]`
    }

    atom<V>(key: Key): Atom<V> {
        return (this.val(key): any)
    }

    getMeta(key: Key): Meta {
        let rec: ?Meta = this._metaMap.get(key)
        if (!rec) {
            if (typeof key === 'function') {
                rec = metaFromTarget(key)
            } else {
                throw new Error(`Can't read annotation from ${this._debugStr(key)}`)
            }
            this._metaMap.set(key, rec)
        }

        return rec
    }

    val<V>(key: Key, _themes?: ?Derivable<RawStyleSheet>[]): Result<V> {
        let atom: ?Result<V> = this._cache.get(key)
        if (atom) {
            return atom
        }
        if (key === this.constructor) {
            atom = this._adapter.atom((this: any))
            this._cache.set(key, atom)
            return atom
        }
        const parentDi: ?Di = this._scopeMap.get(key)
        if (parentDi) {
            return parentDi.val(key, _themes)
        }

        const [target, deps, meta] = this.getMeta(key)
        this._path.push(debugName(key))
        const adapter: Adapter = this._adapter

        if (meta.key) {
            const value = this._values[meta.key]
            if (value !== undefined) {
                if (meta.initializer) {
                    // if has initializer - preload data from values registry only once
                    // on next call - run initializer and fill models
                    this._values[meta.key] = null
                }
                if (meta.construct) {
                    atom = adapter.isAtom(value)
                        ? value.derive((v: V) => new target(value))
                        : adapter.atom(new target(value)) // eslint-disable-line
                } else {
                    atom = adapter.isAtom(value)
                        ? value
                        : adapter.atom(value)
                }
                this._cache.set(key, atom)

                this._path.pop()
                return atom
            }
        }

        if (meta.initializer) {
            const initData = this.val(meta.initializer)
            const [data, obs] = initData.get()

            atom = adapter.atomFromObservable(data, obs)
            this._cache.set(key, atom)

            this._path.pop()
            return atom
        }

        if (meta.isComponent) {
            atom = this._componentCache.get(key)
            if (!atom) {
                const container: Di = meta.localDeps
                    ? this.create().register(meta.localDeps)
                    : this
                const themes: Derivable<RawStyleSheet>[] = []
                const depsAtom: Derivable<mixed[]> = container._resolveDeps(deps, themes)
                atom = adapter.atom((this._createComponent(
                    target,
                    depsAtom,
                    createThemesReactor(adapter.struct(themes))
                ): any))
                this._componentCache.set(key, atom)
            }
            this._cache.set(key, atom)

            this._path.pop()
            return atom
        }

        const depsAtom: Derivable<mixed[]> = this._resolveDeps(deps)
        const preprocess: (v: any) => any = meta.isTheme ? this.__createSheet : passAny
        if (meta.isFactory) {
            if (meta.writable) {
                atom = adapter.atom((this._createFactory(target, depsAtom): any))
            } else {
                atom = depsAtom.derive((deps: mixed[]) => preprocess(fastCall(target, deps)))
            }
        } else {
            if (meta.writable) {
                atom = adapter.atom(this._createObject(target, depsAtom))
            } else {
                atom = depsAtom.derive((deps: mixed[]) => preprocess(fastCreateObject(target, deps)))
            }
        }
        if (meta.isTheme) {
            if (meta.writable) {
                throw new Error(`Them can't be an @service annotated: ${this._debugStr(key)}`)
            }
            if (!_themes) {
                throw new Error(`Theme used as dep not for component: ${this._debugStr(key)}`)
            }
            _themes.push(((atom: any): Derivable<RawStyleSheet>))
        }

        this._cache.set(key, atom)
        this._path.pop()

        return atom
    }

    __createSheet: (theme: any) => RawStyleSheet = (theme: any) => {
        if (!theme || typeof theme !== 'object' || !theme.__css) {
            throw new Error(`Provide this.__css property with jss styles in theme ${this._debugStr(theme)}`)
        }
        const styles: StyleSheet = this._createSheet(theme.__css)
        theme.__styles = styles
        Object.assign(theme, styles.classes)

        return (theme)
    };

    _createObject<V: Object>(target: Class<V>, depsAtom: Derivable<mixed[]>): V {
        const value: V = fastCreateObject(target, depsAtom.get())
        const onChange = (deps: mixed[]) => {
            fastCallMethod(value, target, deps)
        }
        depsAtom.react(onChange, {
            skipFirst: true,
            until: this._stopped
        })

        return value
    }

    _createFactory<V>(target: DepFn<DepFn<V>>, depsAtom: Derivable<mixed[]>): DepFn<V> {
        let value: DepFn<V>  = fastCall(target, depsAtom.get())

        function onChange(deps: mixed[]): void {
            value = fastCall(target, deps)
        }

        depsAtom.react(onChange, {
            skipFirst: true,
            until: this._stopped
        })

        function factory(...args: mixed[]): V {
            return fastCall(value, args)
        }
        factory.displayName = `wrap@${debugName(target)}`

        return factory
    }
}
