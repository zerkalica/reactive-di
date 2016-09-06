// @flow

import {DepInfo, InternalLifeCycle} from 'reactive-di/core/common'
import type {IHandler, RdiMeta} from 'reactive-di/core/common'

import {deps} from 'reactive-di/annotations'

import type {IContext} from 'reactive-di/interfaces/internal'
import type {RegisterDepItem, ArgDep, Key} from 'reactive-di/interfaces/deps'
import type {Adapter, Atom, DerivableArg, DerivableDict, Derivable} from 'reactive-di/interfaces/atom'
import type {SetState, CreateWidget, CreateStyleSheet} from 'reactive-di/interfaces/component'

import debugName from 'reactive-di/utils/debugName'
import derivableAtomAdapter from 'reactive-di/adapters/derivableAtomAdapter'
import createHandlers from 'reactive-di/core/createHandlers'
import MetaRegistry from 'reactive-di/core/MetaRegistry'
import Updater from 'reactive-di/core/Updater'
import Collector from 'reactive-di/core/Collector'
import ComponentControllable from 'reactive-di/core/ComponentControllable'

function dummyCreateWidget() {
    throw new Error('Can\'t create widget: provide widget factory to di')
}

export default class Di {
    displayName: string
    stopped: Atom<boolean>
    adapter: Adapter
    defaults: {[id: string]: any} = {}
    adapter: Adapter

    _metaRegistry: MetaRegistry
    _handlers: {[id: string]: IHandler}
    _collector: Collector<InternalLifeCycle<*>>
    _createWidget: CreateWidget<*, *, *>
    _path: string[] = []

    constructor(
        createWidget?: ?CreateWidget<*, *, *>,
        createStyleSheet?: ?CreateStyleSheet,
        handlers?: {[id: string]: IHandler},
        adapter?: Adapter,
        metaRegistry?: MetaRegistry,
        displayName?: string,
        collector?: Collector<InternalLifeCycle<*>>
    ) {
        this._createWidget = createWidget || dummyCreateWidget
        this.displayName = displayName || 'rootDi'
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

    create(displayName: string): IContext {
        return (new Di(
            null,
            null,
            this._handlers,
            this.adapter,
            this._metaRegistry.copy(),
            displayName,
            this._collector
        )).values(this.defaults)
    }

    wrapComponent<Component>(key: Key): Component {
        const info: DepInfo<any, *> = this._metaRegistry.getMeta(key)
        if (!info.value) {
            info.value = this._createWidget(
                info.target,
                (setState: SetState<*>) => new ComponentControllable(info, setState)
            )
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

        if (key === this.constructor) {
            info.value = this.adapter.atom(((this: any): V))
            collector.addCached(info.lcs)
            return (info.value: any)
        }
        const cache = this._metaRegistry
        const {ctx, target, meta, name} = info
        if (ctx !== this) {
            return ctx.val(target)
        }
        info.resolving = true
        this._path.push(name)
        collector.begin()

        let depsAtom: ?Derivable<mixed[]>
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

        const value: Atom<V> = handler.handle(info)
        info.value = value

        let lc: ?InternalLifeCycle<V>
        if (info.lc) {
            lc = new InternalLifeCycle(this.val(info.lc).get())
            value.react(lc.onUpdate, {
                until: this.stopped
            })
        }
        collector.end(info.lcs, lc)
        info.resolving = false

        this._path.pop()

        return value
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
}
if (0) ((new Di(...(0: any))): IContext)

deps(Di)(Updater)
