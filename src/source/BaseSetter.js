// @flow

import type {ISource, INotifier} from './interfaces'
import {setterKey} from '../interfaces'

type ISetFn<V, E> = (v: any, name: string, v: ISource<V, *>, e?: ?ISource<E, *>) => void

export type ICallbacks<V: Object, S> = {[id: $Keys<V>]: (s: S) => void}

export default class BaseSetter<V: Object, E: Object = V> {
    _v: ISource<V, $Shape<V>>
    _e: ?ISource<E, $Shape<E>>
    _keys: string[]
    _notifier: INotifier

    constructor(v: V, e?: ?E) {
        this._v = v[setterKey]
        this._e = e ? e[setterKey] : null
        this._keys = Object.keys(v)
        this._notifier = this._v.context.notifier
    }

    _createProp(fn: ISetFn<V, E>, name: string) {
        const t = this
        const v = this._v
        const e = this._e
        const notifier = this._notifier
        const oldTrace = notifier.trace || 'BaseSetter'
        function setVal(prop: any) {
            const oldId = notifier.begin(oldTrace)
            fn.call(t, prop, name, v, e)
            notifier.end(oldId)
        }

        setVal.displayName = name

        return setVal
    }

    create<R>(fn: ISetFn<V, E>): ICallbacks<V, R> {
        const keys = this._keys
        const result: ICallbacks<V, R> = {}
        for (let i = 0; i < keys.length; i++) {
            const name = keys[i]
            result[name] = this._createProp(fn, name)
        }

        return result
    }

    static createToggle<VO: Object>(name: string, v: ISource<VO, *>) {
        v.set({
            [name]: !v.get()[name]
        })
    }

    static createSet<VO: Object>(value: string, name: string, v: ISource<VO, *>) {
        v.set({
            [name]: value
        })
    }

    static createEventSet<VO: Object>(e: Event, name: string, v: ISource<VO, *>) {
        e.preventDefault()
        const nv = (e.target: any).value
        if ((v.cached || v.get())[name] !== nv) {
            v.set({
                [name]: nv
            })
        }
    }
}
