/* @flow */
const STRIP_COMMENTS: RegExp = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
const FN_MAGIC: string = 'function';

export default function getFunctionName(func: Function): string {
    if (func.displayName) {
        return func.displayName
    }

    const fnStr = func.toString().replace(STRIP_COMMENTS, '')

    return fnStr.slice(fnStr.indexOf(FN_MAGIC) + FN_MAGIC.length + 1, fnStr.indexOf('('))
}
