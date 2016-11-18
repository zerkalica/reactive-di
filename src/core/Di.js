// @flow

import {DepInfo, isComponent, InternalLifeCycle, atomKey} from 'reactive-di/core/common'
import type {IHandler, RdiMeta} from 'reactive-di/core/common'

import {deps} from 'reactive-di/annotations'

import type {IContext} from 'reactive-di/interfaces/internal'
import type {RegisterDepItem, ArgDep, Key} from 'reactive-di/interfaces/deps' // eslint-disable-line
import type {Adapter, Atom, DerivableArg, DerivableDict, Derivable} from 'reactive-di/interfaces/atom'
import type {ComponentFactory, CreateStyleSheet} from 'reactive-di/interfaces/component'

import debugName from 'reactive-di/utils/debugName'
import derivableAtomAdapter from 'reactive-di/core/derivableAtomAdapter'
import createHandlers from 'reactive-di/core/createHandlers'
import MetaRegistry from 'reactive-di/core/MetaRegistry'
import Updater from 'reactive-di/core/Updater'
import Collector from 'reactive-di/core/Collector'
import type {Middleware} from 'reactive-di/utils/MiddlewareFactory' // eslint-disable-line
import MiddlewareFactory from 'reactive-di/utils/MiddlewareFactory' // eslint-disable-line

const dummyComponentFactory: ComponentFactory = {
    createElement<V>(arg: V): V {
        return arg
    },
    wrapComponent() {
        throw new Error('dummyComponentFactory, can\'t create widget: provide widget factory to di')
    }
}

/**
 * Main dependency injection container
 */
export default class Di {
    /**
     * String name of container
     */
    displayName: string
    stopped: Atom<boolean>
    adapter: Adapter
    defaults: {[id: string]: any} = {}
    adapter: Adapter

    _metaRegistry: MetaRegistry
    _handlers: {[id: string]: IHandler}
    _collector: Collector<InternalLifeCycle<*>>
    _componentFactory: ComponentFactory
    _path: string[] = []
    _mdlFactory: ?MiddlewareFactory
    static uniqId: number = 1

    constructor(
        componentFactory?: ?ComponentFactory,
        createStyleSheet?: ?CreateStyleSheet,

        handlers?: {[id: string]: IHandler},
        adapter?: Adapter,
        metaRegistry?: MetaRegistry,
        displayName?: string,
        collector?: Collector<InternalLifeCycle<*>>,
        mdlFactory?: ?MiddlewareFactory
    ) {
        this._componentFactory = componentFactory || dummyComponentFactory
        const c = this.constructor
        c.uniqId = c.uniqId + 1 // eslint-disable-line
        this.displayName = (displayName || 'root') + String(c.uniqId)
        this._mdlFactory = mdlFactory
        this.adapter = adapter || derivableAtomAdapter
        this._handlers = handlers || createHandlers(createStyleSheet)
        this._metaRegistry = metaRegistry || new MetaRegistry()
        this._collector = collector || new Collector()

        this._metaRegistry.setContext(this)
        this.stopped = this.adapter.atom(false)
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

    /**
     * Create new copy of container and inherit all resolved dependencies
     */
    create(displayName: string): IContext {
        return (new Di(
            this._componentFactory,
            null,
            this._handlers,
            this.adapter,
            this._metaRegistry.copy(),
            this.displayName + '.' + displayName,
            this._collector,
            this._mdlFactory
        )).values(this.defaults)
    }

    middlewares(registered: ArgDep[]): IContext {
        if (!registered) {
            return this
        }
        const middlewares: Middleware[] = this.resolveDeps(registered).get()
        // middlewares is services, not derivable
        this._mdlFactory = this._mdlFactory
            ? this._mdlFactory.copy(middlewares)
            : new MiddlewareFactory(middlewares)

        return this
    }

    wrapComponent<Component>(key: Function): Component {
        if (!isComponent(key)) {
            return (key: any)
        }
        const info: DepInfo<any, *> = this._metaRegistry.getMeta(key)
        if (!info.value) {
            info.value = (this._componentFactory.wrapComponent(
                info
            ): any)
        }

        return (info.value: any)
    }

    val<V>(key: Key): Atom<V> {
        const collector: Collector<InternalLifeCycle<*>> = this._collector
        const info: DepInfo<V, RdiMeta> = this._metaRegistry.getMeta(key)
        if (info.value) {
            collector.addCached(info.lcs)
            return (info.value: any)
        } else if (info.resolving) {
            throw new Error(`Circular dependency detected: ${this.debugStr(key)}`)
        }

        const {ctx, target, meta, name} = info
        if (ctx !== this) {
            return ctx.val(target)
        }
        info.resolving = true
        this._path.push(name)
        collector.begin()

        let handler: ?IHandler

        switch (meta.type) {
            case 'derivable':
                handler = this._handlers.derivable
                break
            case 'service':
                handler = this._handlers.service
                break
            case 'source':
                handler = this._handlers.source
                break
            case 'theme':
                handler = this._handlers.theme
                break
            case 'status':
                handler = this._handlers.status
                break
            case 'abstract':
                handler = this._handlers.abstract
                break
            default:
                throw new Error(`Handler not found for type: ${ctx.debugStr(meta.type)}`)
        }

        let value: Atom<V> = handler.handle(info)
        info.value = value

        let lc: ?InternalLifeCycle<V>
        if (info.lc) {
            lc = new InternalLifeCycle(this.val(info.lc).get())
            if (lc.isEqual) {
                value = value.withEquality(lc.isEqual)
            }
            lc.onUpdate(value.get())
        }
        collector.end(info.lcs, lc)
        info.resolving = false

        this._path.pop()

        return value
    }

    debugStr(sub: ?mixed): string {
        return `${debugName(sub)} [${this._path.join('.')}]`
    }

    preprocess(raw: any, depInfo: DepInfo<*, *>): any {
        let value = raw
        if (this._mdlFactory) {
            value = this._mdlFactory.wrap(value, depInfo.meta.type)
        }
        if (value && typeof value === 'object') {
            value.__di = this.displayName
            value[atomKey] = depInfo
        }
        return value
    }

    resolveDeps(argDeps: ArgDep[], lcs?: InternalLifeCycle<*>[]): Derivable<any[]> {
        const resolvedArgs: DerivableArg[] = []
        if (lcs) {
            this._collector.begin()
        }
        for (let i = 0, l = argDeps.length; i < l; i++) {
            const argDep: ArgDep = argDeps[i]
            if (typeof argDep === 'object') {
                const result: DerivableDict = {}
                for (let prop in argDep) { // eslint-disable-line
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
}
if (0) ((new Di(...(0: any))): IContext) // eslint-disable-line

deps(Di)(Updater)
