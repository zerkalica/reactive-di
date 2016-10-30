// @flow

import type {RegisterDepItem, Key} from 'reactive-di/interfaces/deps' // eslint-disable-line
import type {IContext} from 'reactive-di/interfaces/internal'
import {DepInfo} from 'reactive-di/core/common'

export default class MetaRegistry {
    _context: IContext
    _metaMap: Map<Key, DepInfo<any, any>>

    constructor(metaMap?: Map<Key, DepInfo<*, *>>) {
        this._metaMap = metaMap || new Map()
    }

    setContext(context: IContext): MetaRegistry {
        this._context = context
        const key: Function = context.constructor
        const di = new DepInfo(key, key, context)
        di.value = (context: any)
        this._metaMap.set(key, di)
        return this
    }

    copy(): MetaRegistry {
        return new MetaRegistry(new Map(this._metaMap))
    }

    add(registered?: ?RegisterDepItem[]): void {
        if (!registered) {
            return
        }
        const ctx = this._context
        const metaMap = this._metaMap
        let key: Key
        let target: Function
        for (let i = 0, l = registered.length; i < l; i++) {
            const pr: RegisterDepItem = registered[i]
            if (Array.isArray(pr)) {
                if (pr.length !== 2) {
                    throw new Error(`Provide tuple of two items in register() ${ctx.debugStr(pr)}`)
                }
                key = pr[0]
                target = pr[1]
                if (typeof target !== 'function') {
                    throw new Error(`Only function as register target, given: ${ctx.debugStr(target)}`)
                }
            } else {
                if (typeof pr !== 'function') {
                    throw new Error(`Only function as register target, given: ${ctx.debugStr(pr)}`)
                }
                key = pr
                target = pr
            }

            if (key !== target) {
                const rec: ?DepInfo<*, *> = metaMap.get(target)
                const depInfo = new DepInfo(target, key, (rec ? rec.ctx : null) || ctx)
                metaMap.set(key, depInfo)
                metaMap.set(target, depInfo)
            } else {
                metaMap.set(key, new DepInfo(target, key, ctx))
            }
        }
    }

    getMeta<V, M>(key: Key): DepInfo<V, M> {
        let rec: ?DepInfo<V, M> = this._metaMap.get(key)
        if (!rec) {
            if (typeof key === 'function') {
                rec = new DepInfo(key, key, this._context)
            } else {
                throw new Error(`Can't read annotation from ${this._context.debugStr(key)}`)
            }
            this._metaMap.set(key, rec)
        }
        if (key !== rec.target) {
            this._metaMap.set(rec.target, rec)
        }

        return rec
    }
}
