// @flow

import type {Derivable} from 'reactive-di/interfaces/atom'
import type {LifeCycle, RegisterDepItem, Key} from 'reactive-di/interfaces/deps'
import type {RdiMeta, IContext} from 'reactive-di/common'
import {DepInfo, isAbstract} from 'reactive-di/common'

export default class MetaRegistry {
    _context: IContext
    _metaMap: Map<Key, DepInfo<any, any>>

    constructor(metaMap?: Map<Key, DepInfo<*, *>>) {
        this._metaMap = metaMap || new Map()
    }

    setContext(context: IContext): MetaRegistry {
        this._context = context
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
        let di: ?IContext
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

            if (target !== key && isAbstract(key)) {
                const rec: ?DepInfo<*, *> = metaMap.get(target)
                di = (rec ? rec.ctx : null) || ctx
            } else {
                di = ctx
            }
            metaMap.set(key, new DepInfo(target, key, di))
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
