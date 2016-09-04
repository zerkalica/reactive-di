// @flow

import {DepInfo, InternalLifeCycle} from 'reactive-di/common'
import type {IHandler, IContext, RdiMetaType, RdiMeta} from 'reactive-di/common'

import {deps} from 'reactive-di/annotations'

import type {RegisterDepItem, Key, ArgDep, LifeCycle} from 'reactive-di/interfaces/deps'
import type {Adapter, Atom, Derivable, DerivableArg, DerivableDict, CacheMap} from 'reactive-di/interfaces/atom'
import debugName from 'reactive-di/utils/debugName'
import derivableAtomAdapter from 'reactive-di/adapters/derivableAtomAdapter'
import createHandlers from 'reactive-di/createHandlers'
import MetaRegistry from 'reactive-di/MetaRegistry'
import Updater from 'reactive-di/Updater'
import Collector from 'reactive-di/Collector'

export default class Di {
    displayName: string
    adapter: Adapter
    defaults: {[id: string]: any};
    stopped: Atom<boolean>

    _metaRegistry: MetaRegistry
    _handlers: Map<RdiMetaType, IHandler>
    _path: string[] = []
    _collector: Collector<InternalLifeCycle<*>>

    constructor(
        handlers?: Map<RdiMetaType, IHandler>,
        adapter?: Adapter,
        metaRegistry?: MetaRegistry,
        displayName?: string,
        collector?: Collector<InternalLifeCycle<*>>
    ) {
        this.displayName = displayName || 'rootDi'
        this.adapter = adapter || derivableAtomAdapter
        this._handlers = handlers || createHandlers()
        this._metaRegistry = metaRegistry || new MetaRegistry()
        this._metaRegistry.setContext(this)
        this.stopped = this.adapter.atom(false)
        this.defaults = {}
        this._collector = collector || new Collector()
    }

    stop(): IContext {
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

    create(displayName: string): IContext {
        return (new Di(
            this._handlers,
            this.adapter,
            this._metaRegistry.copy(),
            displayName,
            this._collector
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

    resolveDeps(deps: ArgDep[], lcs?: InternalLifeCycle<*>[]): Derivable<mixed[]> {
        const resolvedArgs: DerivableArg[] = []
        if (lcs) {
            this._collector.begin()
        }
        for (let i = 0, l = deps.length; i < l; i++) {
            const argDep: ArgDep = deps[i]
            if (typeof argDep === 'object') {
                const result: DerivableDict = {}
                for (let prop in argDep) {
                    const dep: Key = argDep[prop]
                    if (!dep) {
                        throw new Error(`Not a dependency, need a function: ${debugName(prop || i)}`)
                    }
                    result[prop] = this.val(dep)
                }
                resolvedArgs.push(result)
            } else {
                if (!argDep) {
                    throw new Error(`Not a dependency, need a function: ${debugName(i)}`)
                }
                resolvedArgs.push(this.val(argDep))
            }
        }
        if (lcs) {
            this._collector.end(lcs)
        }

        return this.adapter.struct(resolvedArgs)
    }

    val<V>(key: Key, noCache?: boolean): Atom<V> {
        const collector: Collector<InternalLifeCycle<*>> = this._collector
        const info: DepInfo<V, RdiMeta> = this._metaRegistry.getMeta(key)
        if (info.value) {
            collector.addCached(info.lcs)
            return (info.value: any)
        } else if (info.resolving) {
            throw new Error(`Circular dependency detected: ${this.debugStr(key)}`)
        }

        if (key === this.constructor) {
            info.value = this.adapter.atom(((this: any): V))
            collector.addCached(info.lcs)
            return (info.value: any)
        }
        const cache = this._metaRegistry
        const {ctx, target, meta, name} = info
        if (ctx !== this) {
            return ctx.val(target, noCache)
        }
        info.resolving = true

        this._path.push(name)
        collector.begin()
        const adapter: Adapter = this.adapter

        let depsAtom: ?Derivable<mixed[]>
        const handler: ?IHandler = this._handlers.get(meta.type)
        if (!handler) {
            throw new Error(`Handler not found for type: ${this.debugStr(meta.type)}`)
        }
        const value: Atom<V> = handler.handle(info)
        if (!noCache) {
            info.value = value
        }
        let lc: ?InternalLifeCycle<V>
        if (info.lc) {
            lc = new InternalLifeCycle(ctx.val(info.lc).get(), ctx.stopped)
            value.react(lc.update, {
                until: this.stopped
            })
        }
        collector.end(info.lcs, lc)
        handler.postHandle(info)
        info.resolving = false

        this._path.pop()

        return value
    }
}
if (0) ((new Di(...(0: any))): IContext)

deps(Di)(Updater)
