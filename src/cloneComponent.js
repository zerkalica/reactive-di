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

export default function cloneComponent<V: Function>(fn: V, aliases: IProvideItem[], name?: string): V {
    const cloned = function () {
        switch (arguments.length) {
            case 1: return fn(arguments[0])
            case 2: return fn(arguments[0], arguments[1])
            case 3: return fn(arguments[0], arguments[1], arguments[2])
            case 4: return fn(arguments[0], arguments[1], arguments[2], arguments[3])
            case 5: return fn(arguments[0], arguments[1], arguments[2], arguments[3], arguments[4])
            default: return fn.apply(null, arguments)
        }
    }
    cloned.deps = fn.deps
    cloned._r = fn._r
    cloned.aliases = fn.aliases ? fn.aliases.concat(aliases) : aliases
    cloned.displayName = name || `cloneComponent(${dn(fn)}, [${aliases.map(provideMap).join(', ')}])`

    return (cloned: any)
}
