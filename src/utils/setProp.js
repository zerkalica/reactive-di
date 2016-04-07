/* @flow */

export default function setProp(target: Object|Function, name: string, value: any): void {
    Object.defineProperty(target, name, {
        value,
        writable: false,
        configurable: false,
        enumerable: false
    })
}
