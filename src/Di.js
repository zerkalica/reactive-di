// @flow
import {
    paramTypesKey,
    metaKey,
    RdiMeta
} from './annotations'
import type {
    Initializer,
    RegisterDepItem,
    DepAlias,
    Dep,
    ArgDep,
    InitData
} from './annotations'
import debugName from './utils/debugName'
import {
    fastCallMethod,
    fastCall,
    fastCreateObject
} from './utils/fastCall'

import derivableAtomAdapter from './adapters/derivableAtomAdapter'
import type {Adapter, Reactor, Atom, Derivable, DerivableArg, DerivableDict} from './adapters/Adapter'
import ComponentState from './ComponentState'
import type {DiResolver, InjectComponent} from './ComponentState'

function pass<V>(state: ComponentState<V>): V {
    return state.target
}

type CacheMap = Map<Function|string, Derivable<any>>

export default class Di<Component> {
    _cache: CacheMap;
    _regMap: Map<Dep<*>, Di<Component>>;
    _adapter: Adapter = derivableAtomAdapter;
    _reactors: Reactor<*>[] = [];
    _createComponent: InjectComponent<Component, *>;
    _registered: RegisterDepItem[];

    _values: {[id: string]: any};

    constructor(
        createComponent: InjectComponent<Component, *> = pass,
        _regMap?: Map<Dep<*>, Di<Component>> = new Map()
    ) {
        this._cache = new Map()
        this._values = {}
        this._createComponent = createComponent
        this._registered = []
        this._regMap = _regMap
    }

    values(values: {[id: string]: any}): Di<Component> {
        this._values = values
        return this
    }

    register(registered?: RegisterDepItem[] = []): Di<Component> {
        this._registered = registered
        return this
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

    create(): Di<Component> {
        const m = new Map(this._regMap)
        const parentRegistered = this._registered
        for (let i = 0, l = parentRegistered.length; i < l; i++) {
            const pr = parentRegistered[i]
            if (Array.isArray(pr)) {
                m.set(pr[0], this)
            } else {
                m.set(pr, this)
            }
        }
        return new Di(
            this._createComponent,
            m
        )
    }

    val<V>(key: Dep<V>): Derivable<V>|Atom<V> {
        let atom: ?(Derivable<V>|Atom<V>) = this._cache.get(key)
        if (atom) {
            return atom
        }

        const parentDi: ?Di<Component> = this._regMap.get(key)
        if (parentDi) {
            return parentDi.val(key)
        }

        const target: Dep<V> = key
        const deps: ArgDep[] = (target: Function)[paramTypesKey] || []
        const meta: ?RdiMeta = (target: Function)[metaKey]
        if (!meta) {
            throw new Error(`RdiMeta not found: "${debugName(target)}"`)
        }
        const adapter: Adapter = this._adapter
        if (meta.key) {
            const value = this._values[meta.key]
            if (value) {
                if (meta.initializer) {
                    // if has initializer - preload data from values registry only once
                    // on next call - run initializer and fill models
                    this._values[meta.key] = null
                }
                if (meta.construct) {
                    atom = adapter.isAtom(value)
                        ? value.derive((raw) => new target(raw))
                        : adapter.atom(new target(value))
                } else if (!adapter.isAtom(value)) {
                    atom = adapter.atom(value)
                } else {
                    atom = value
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

        const depsAtom: Derivable<mixed[]> = this._resolveDeps(deps)

        if (meta.isComponent) {
            const container: Di<Component> = meta.localDeps
                ? this.create().register(meta.localDeps)
                : this
            const component = this._createComponent(new ComponentState((target: any), depsAtom))
            atom = adapter.atom((component: any))
            this._cache.set(key, atom)

            return atom
        }

        if (meta.isFactory) {
            if (meta.isDerivable) {
                atom = depsAtom.derive((deps: mixed[]) => fastCall(target, deps))
            } else {
                atom = adapter.atom(this._createFactory(target, depsAtom))
            }
        } else {
            if (meta.isDerivable) {
                atom = depsAtom.derive((deps: mixed[]) => fastCreateObject(
                    ((target: any): Class<V>),
                    deps
                ))
            } else {
                atom = adapter.atom(this._createObject(target, depsAtom))
            }
        }

        this._cache.set(key, atom)

        return atom
    }

    _createObject<V>(target: Dep<V>, depsAtom: Derivable<mixed[]>): V {
        const value: V = fastCreateObject(((target: any): Class<V>), depsAtom.get())
        const onChange = (deps: mixed[]) => {
            fastCallMethod((value: any), target, deps)
        }
        const reactor: Reactor<mixed[]> = depsAtom.reactor(onChange)
        reactor.start()
        this._reactors.push(reactor)

        return value
    }

    _createFactory<V>(target: Dep<V>, depsAtom: Derivable<mixed[]>): V {
        let value: V & Function = fastCall(target, depsAtom.get())

        function onChange(deps: mixed[]): void {
            value = fastCall(target, deps)
        }
        const reactor: Reactor<mixed[]> = depsAtom.reactor(onChange)
        reactor.start()
        this._reactors.push(reactor)

        function factory(...args: mixed[]): mixed {
            return fastCall(value, args)
        }
        factory.displayName = `wrap@${debugName(target)}`

        return (factory: any)
    }

    start(): void {
        const r = this._reactors
        for (let i = 0, l = r.length; i < l; i++) {
            r[i].start()
        }
    }

    stop(): void {
        this._cache = new Map()
        const r = this._reactors
        for (let i = 0, l = r.length; i < l; i++) {
            r[i].stop()
        }
    }
}
