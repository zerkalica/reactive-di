/* @flow */

const STRIP_COMMENTS: RegExp = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
const FN_MAGIC: string = 'function';

export default function getFunctionName(func: ?Function|string|number|Object): string {
    if (
        func === null
        || typeof func !== 'object'
        && typeof func !== 'function'
    ) {
        return JSON.stringify(func)
    }

    if (func.displayName) {
        return func.displayName
    }
    const fn = typeof func === 'object'
        ? func.constructor
        : func;

    if (fn === Object) {
        return Object.keys(func).join(',')
    }

    const fnStr = fn.toString().replace(STRIP_COMMENTS, '')

    return fnStr.slice(fnStr.indexOf(FN_MAGIC) + FN_MAGIC.length + 1, fnStr.indexOf('('))
}
