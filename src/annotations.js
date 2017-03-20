// @flow

import type {ISource} from './source/interfaces'

import {setterKey} from './interfaces'
import type {IDepRegister, IRawArg} from './interfaces'
import GenericThemeHook from './theme/GenericThemeHook'

/* eslint-disable no-param-reassign, no-bitwise */

export interface SourceMetaRec {
    construct?: boolean;
    instance?: boolean;
}

export interface ComponentMetaRec {
    register?: IDepRegister[];
    propsTo?: Function;
    onError?: Function;
}

export function deps<V: Function>(...args: IRawArg[]): (target: V) => V {
    return function _deps(target: V) {
        if (args.length) {
            target._r1 = args
        }
        return target
    }
}

export function factory<V: Function>(target: V): V {
    target._r2 = (target._r2 || 0) | 2
    target._r0 = 0

    return target
}

export function component<V: Function>(rec?: ComponentMetaRec): (target: V) => V {
    return function _component(target: V) {
        target._r2 = (target._r2 || 0) | 1
        target._rdiCmp = rec
        return target
    }
}

export function theme<V: Function>(target: V): V {
    target._rdiHook = GenericThemeHook
    return target
}

export function src<V: any>(v: V): ISource<V, *> {
    return v[setterKey]
}

export function source<V: Function>(rec: SourceMetaRec): (target: V) => V {
    return function _source(target: V) {
        target._r0 = 0
        target._r2 = (target._r2 || 0) | (rec.construct ? 64 : 0) | (rec.instance ? 128 : 0)
        return target
    }
}

export function value<V: Function>(target: V): V {
    target._r2 = (target._r2 || 0) | 8
    return target
}

export function actions<V: Function>(target: V): V {
    target._r2 = (target._r2 || 0) | 16
    return target
}

export function abstract<V: Function>(target: V): V {
    target._r2 = (target._r2 || 0) | 32
    return target
}

export function hooks<V1: Function, V2: Function>(model: V1): (hook: V2) => V2 {
    return function _hooks(hook: V2) {
        model._rdiHook = hook
        // hook._r2 = (hook._r2 || 0) | 16

        return hook
    }
}

let cloneNumber: number = 0

export function cloneComponent<C: Function>(origin: C, rec?: ComponentMetaRec): C {
    function target(arg1: any, arg2: any, h: any) {
        return origin(arg1, arg2, h)
    }
    target.displayName = (origin.displayName || origin.name) + '#clone-' + (cloneNumber || '0')
    cloneNumber++ // eslint-disable-line
    Object.setPrototypeOf(target, origin)
    target._r2 = 1
    if (rec) {
        target._rdiCmp = rec
    }

    return (target: any)
}
