// @flow

import type {IRenderFn, IProvideItem} from './interfaces'

function dn(fn?: ?(Function | Object | mixed)): string {
    if (!fn) return 'null'

    if (typeof fn === 'object') {
        const cons = fn.constructor
        return cons.displayName || cons.name
    }
    if (typeof fn === 'function') {
        return fn.displayName || fn.name
    }

    return String(fn)
}

function provideMap(item: IProvideItem): string {
    return item instanceof Array
        ? `[${dn(item[0])}, ${dn(item[1])}]`
        : dn(item)
}

export default function cloneComponent<V: Function>(fn: V, contextAliases: IProvideItem[], name?: string): V {
    const cloned = function () {
        const a = arguments
        switch (a.length) {
            case 1: return fn(a[0])
            case 2: return fn(a[0], a[1])
            case 3: return fn(a[0], a[1], a[2])
            case 4: return fn(a[0], a[1], a[2], a[3])
            case 5: return fn(a[0], a[1], a[2], a[3], a[4])
            default: return fn.apply(null, a)
        }
    }
    cloned.deps = fn.deps
    cloned._r = fn._r
    cloned.contextAliases = fn.contextAliases ? fn.contextAliases.concat(contextAliases) : contextAliases
    cloned.displayName = name || `cloneComponent(${dn(fn)}, [${contextAliases.map(provideMap).join(', ')}])`

    return (cloned: any)
}
