// @flow

import type {IDepRegister, IRawArg} from './interfaces'
import GenericThemeHook from './theme/GenericThemeHook'

/* eslint-disable no-param-reassign */

export interface SourceMetaRec {
    key: string;
    loaded?: boolean;
}

export interface ComponentMetaRec {
    register?: IDepRegister[];
    onError?: Function;
}

export function deps<V: Function>(...args: IRawArg[]): (target: V) => V {
    return (target: V) => {
        if (args.length) {
            target._rdiArg = args
        }
        return target
    }
}

export function factory<V: Function>(target: V): V {
    target._rdiFn = true
    target._rdiId = 0

    return target
}

export function component<V: Function>(rec?: ComponentMetaRec): (target: V) => V {
    return (target: V) => {
        target._rdiJsx = true
        target._rdiCmp = rec
        return target
    }
}

export function theme<V: Function>(target: V): V {
    target._rdiHook = GenericThemeHook
    return target
}

export function source<V: Function>(rec: SourceMetaRec): (target: V) => V {
    return (target: V) => {
        target._rdiId = 0
        target._rdiKey = rec.key
        target._rdiConstr = rec.construct || false
        target._rdiInst = rec.instance || false
        target._rdiLoaded = rec.loaded || false
        return target
    }
}

export function actions<V: Function>(target: V): V {
    target._rdiEnd = true
    return target
}

export function abstract<V: Function>(target: V): V {
    target._rdiAbs = true
    return target
}

export function hooks<V1: Function, V2: Function>(target: V1): (lc: V2) => V2 {
    return (lc: V2) => {
        target._rdiHook = lc
        lc._rdiEnd = true

        return lc
    }
}

let cloneNumber: number = 0

export function cloneComponent<C: Function>(src: C, rec?: ComponentMetaRec): C {
    function target(arg1: any, arg2: any) {
        return src(arg1, arg2)
    }
    target.displayName = (src.displayName || src.name) + '#clone-' + (cloneNumber || '0')
    cloneNumber++ // eslint-disable-line
    Object.setPrototypeOf(target, src)
    target._rdiJsx = true
    if (rec) {
        target._rdiCmp = rec
    }

    return (target: any)
}
