// @flow

import {paramTypesKey, metaKey, RdiMeta} from './annotations'
import type {Initializer, RegisterDepItem, DepAlias, Dep, ArgDep, InitData} from './annotations'
import debugName from './utils/debugName'
import {fastCallMethod, fastCall, fastCreateObject} from './utils/fastCall'
import derivableAtomAdapter from './adapters/derivableAtomAdapter'
import type {Adapter, Reactor, Atom, Derivable, DerivableArg, DerivableDict, CreateWidget} from './adapters/Adapter'

function pass<V: Function>(target: V, depsAtom: Derivable<V>): V {
    return target(depsAtom)
}

type CacheMap = Map<Function|string, Derivable<any>>

type Meta = [Function, ArgDep[], RdiMeta]

function metaFromTarget(target: Function): Meta {
    return [
        target,
        target[paramTypesKey] || [],
        target[metaKey]
    ]
}

export default class Di {
    _cache: CacheMap;
    _componentCache: CacheMap;

    _scopeMap: Map<Dep<*>, Di>;
    _childScopeMap: Map<Dep<*>, Di>;
    _metaMap: Map<Dep<*>, Meta>;

    _adapter: Adapter;
    _createComponent: CreateWidget<*, *, *>;

    _registered: RegisterDepItem[];
    _values: {[id: string]: any};

    _stopped: Atom<boolean>;

    constructor(
        createComponent?: CreateWidget<*, *, *> = pass,
        adapter?: Adapter = derivableAtomAdapter,
        _scopeMap?: Map<Dep<*>, Di> = new Map(),
        _componentCache?: CacheMap = new Map(),
        _metaMap?: Map<Dep<*>, Meta> = new Map()
    ) {
        this._adapter = adapter
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

    values(values?: ?{[id: string]: any}): Di {
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
                    throw new Error(`Provide tuple of two items in register()`)
                }
                childScopeMap.set(pr[0], this)
                metaMap.set(pr[0], metaFromTarget(pr[1]))
            } else {
                childScopeMap.set(pr, this)
                metaMap.set(pr, metaFromTarget(pr))
            }
        }

        return this
    }

    create(): Di {
        return (new Di(
            this._createComponent,
            this._adapter,
            this._childScopeMap,
            this._componentCache,
            new Map(this._metaMap)
        )).values(this._values)
    }

    _resolveDeps(deps: ArgDep[]): Derivable<any> {
        const resolvedArgs: DerivableArg[] = []
        for (let i = 0, l = deps.length; i < l; i++) {
            const argDep: ArgDep = deps[i]
            if (typeof argDep === 'object') {
                const result: DerivableDict = {}
                for (let prop in argDep) {
                    result[prop] = this.val(argDep[prop])
                }
                resolvedArgs.push(result)
            } else {
                resolvedArgs.push(this.val(argDep))
            }
        }

        return this._adapter.struct(resolvedArgs)
    }

    val<V>(key: Dep<V>): Derivable<V>|Atom<V> {
        let atom: ?(Derivable<V>|Atom<V>) = this._cache.get(key)
        if (atom) {
            return atom
        }
        const parentDi: ?Di = this._scopeMap.get(key)
        if (parentDi) {
            return parentDi.val(key)
        }

        const [target, deps, meta]: Meta = this._metaMap.get(key) || metaFromTarget(key)
        if (!meta) {
            throw new Error(`RdiMeta not found: "${debugName(target)}"`)
        }
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
                        ? value.derive((v: V) => new (target: Function)(value))
                        : adapter.atom(new (target: Function)(value)) // eslint-disable-line
                } else {
                    atom = adapter.isAtom(value)
                        ? value
                        : adapter.atom(value)
                }
                this._cache.set(key, atom)

                return atom
            }
        }

        if (meta.initializer) {
            const initData = this.val(meta.initializer)
            const [data, obs] = initData.get()

            atom = adapter.atomFromObservable(data, obs)
            this._cache.set(key, atom)

            return atom
        }

        if (meta.isComponent) {
            atom = this._componentCache.get(key)
            if (!atom) {
                const container: Di = meta.localDeps
                    ? this.create().register(meta.localDeps)
                    : this
                const depsAtom: Derivable<mixed[]> = container._resolveDeps(deps)
                atom = adapter.atom((this._createComponent((target: any), depsAtom): any))
                this._componentCache.set(key, atom)
            }
            this._cache.set(key, atom)

            return atom
        }

        const depsAtom: Derivable<mixed[]> = this._resolveDeps(deps)
        if (meta.isFactory) {
            if (meta.isService) {
                atom = adapter.atom(this._createFactory(target, depsAtom))
            } else {
                atom = depsAtom.derive((deps: mixed[]) => fastCall(target, deps))
            }
        } else {
            if (meta.isService) {
                atom = adapter.atom(this._createObject(target, depsAtom))
            } else {
                atom = depsAtom.derive((deps: mixed[]) => fastCreateObject(
                    ((target: any): Class<V>),
                    deps
                ))
            }
        }

        this._cache.set(key, atom)

        return atom
    }

    _createObject<V>(target: Dep<V>, depsAtom: Derivable<mixed[]>): V {
        const value: V = fastCreateObject(((target: Function): Class<V>), depsAtom.get())
        const onChange = (deps: mixed[]) => {
            fastCallMethod((value: any), target, deps)
        }
        depsAtom.react(onChange, {
            skipFirst: true,
            until: this._stopped
        })

        return value
    }

    _createFactory<V>(target: Dep<V>, depsAtom: Derivable<mixed[]>): V {
        let value: V & Function = fastCall(target, depsAtom.get())

        function onChange(deps: mixed[]): void {
            value = fastCall(target, deps)
        }

        depsAtom.react(onChange, {
            skipFirst: true,
            until: this._stopped
        })

        function factory(...args: mixed[]): mixed {
            return fastCall(value, args)
        }
        factory.displayName = `wrap@${debugName(target)}`

        return (factory: any)
    }
}
