// @flow

import {DepInfo} from 'reactive-di/common'
import type {IHandler, IContext, RdiMetaType, Collector, RdiMeta} from 'reactive-di/common'

import {deps} from 'reactive-di/annotations'

import type {RegisterDepItem, Key, ArgDep} from 'reactive-di/interfaces/deps'
import type {Adapter, Atom, Derivable, DerivableArg, DerivableDict, CacheMap} from 'reactive-di/interfaces/atom'
import debugName from 'reactive-di/utils/debugName'
import derivableAtomAdapter from 'reactive-di/adapters/derivableAtomAdapter'
import createHandlers from 'reactive-di/createHandlers'
import MetaRegistry from 'reactive-di/MetaRegistry'
import Updater from 'reactive-di/Updater'

export default class Di {
    displayName: string
    cache: CacheMap
    adapter: Adapter
    defaults: {[id: string]: any};
    stopped: Atom<boolean>

    _metaRegistry: MetaRegistry
    _handlers: Map<RdiMetaType, IHandler<*, *>>
    _path: string[] = []

    constructor(
        handlers?: Map<RdiMetaType, IHandler<*, *>>,
        adapter?: Adapter,
        metaRegistry?: MetaRegistry,
        displayName?: string
    ) {
        this.displayName = displayName || 'rootDi'
        this.adapter = adapter || derivableAtomAdapter
        this._handlers = handlers || createHandlers()
        this._metaRegistry = metaRegistry || new MetaRegistry()
        this._metaRegistry.setContext(this)
        this.stopped = this.adapter.atom(false)
        this.cache = new Map()
        this.defaults = {}
    }

    stop(): Di {
        this.stopped.set(true)
        return this
    }

    values(values?: ?{[id: string]: mixed}): IContext {
        this.defaults = values || {}
        return this
    }

    register(registered?: ?RegisterDepItem[]): IContext {
        this._metaRegistry.add(registered)
        return this
    }

    create(displayName?: string): IContext {
        return (new Di(
            this._handlers,
            this.adapter,
            this._metaRegistry.copy(),
            displayName
        )).values(this.defaults)
    }

    debugStr(sub: ?mixed): string {
        return `${debugName(sub)} [${this._path.join('.')}]`
    }

    preprocess(entity: any): any {
        if (entity && typeof entity === 'object') {
            entity.__di = this.displayName
        }
        return entity
    }

    getMeta(key: Key): DepInfo<RdiMeta> {
        return this._metaRegistry.getMeta(key)
    }

    resolveDeps(deps: ArgDep[], collector?: Collector): Derivable<mixed[]> {
        const resolvedArgs: DerivableArg[] = []
        for (let i = 0, l = deps.length; i < l; i++) {
            const argDep: ArgDep = deps[i]
            if (typeof argDep === 'object') {
                const result: DerivableDict = {}
                for (let prop in argDep) {
                    const dep: Key = argDep[prop]
                    if (!dep) {
                        throw new Error(`Not a dependency, need a function: ${debugName(prop || i)}`)
                    }
                    result[prop] = this.val(dep, collector)
                }
                resolvedArgs.push(result)
            } else {
                if (!argDep) {
                    throw new Error(`Not a dependency, need a function: ${debugName(i)}`)
                }
                resolvedArgs.push(this.val(argDep, collector))
            }
        }

        return this.adapter.struct(resolvedArgs)
    }

    val<V>(key: Key, collector?: Collector): Atom<V> {
        let atom: ?Atom<V> = this.cache.get(key)
        if (atom) {
            if (collector) {
                collector.add(this.getMeta(key), atom)
            }
            return atom
        } else if (atom === null) {
            throw new Error(`Circular-dependency detected: ${this.debugStr(key)}`)
        }

        const cache = this.cache
        if (key === this.constructor) {
            atom = this.adapter.atom(this)
            cache.set(key, atom)
            return atom
        }
        const depInfo: DepInfo<RdiMeta> = this.getMeta(key)
        const {ctx, target, meta, name} = depInfo
        if (ctx !== this) {
            return ctx.val(target, collector)
        }
        cache.set(target, null)
        if (key !== target) {
            cache.set(key, null)
        }

        this._path.push(name)

        const adapter: Adapter = this.adapter

        let depsAtom: ?Derivable<mixed[]>
        const handler: ?IHandler<RdiMeta, any> = this._handlers.get(meta.type)
        if (!handler) {
            throw new Error(`Handler not found for type: ${this.debugStr(meta.type)}`)
        }
        atom = handler.handle(depInfo, collector)
        cache.set(key, atom)
        if (target !== key) {
            cache.set(target, atom)
        }
        handler.postHandle(depInfo, atom)

        if (collector) {
            collector.add(depInfo, atom)
        }
        this._path.pop()

        return atom
    }
}
if (0) ((new Di(...(0: any))): IContext)

deps(Di)(Updater)
