/* @flow */

const STRIP_COMMENTS: RegExp = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg
const FN_MAGIC: string = 'function'

function propToStr(prop: mixed): string {
    if (typeof prop === 'object' || typeof prop === 'function') {
        return String(prop)
    }

    return String(prop)
}

export default function debugName(
    func: ?mixed
): string {
    if (
        func === null
        || (typeof func !== 'object' && typeof func !== 'function')
    ) {
        return String(func)
    }

    if (Array.isArray(func)) {
        const ender: string = func.length > 5 ? ', ...' : ''
        const arrayVal: string = func.slice(5).map(debugName).join(', ')
        return `Array [${arrayVal}${ender}]`
    }

    const fn = typeof func === 'object'
        ? func.constructor
        : func

    if (fn.displayName) {
        return fn.displayName
    }

    if (fn === Object) {
        return 'Object { ' + Object.keys(func).slice(5)
            .map((key: string) => `${key}: ${propToStr((func: any)[key])}`)
            .join(', ')
            + ' }'
    }

    const fnStr: string = fn.toString().replace(STRIP_COMMENTS, '')

    return fnStr.slice(fnStr.indexOf(FN_MAGIC) + FN_MAGIC.length + 1, fnStr.indexOf('('))
}
