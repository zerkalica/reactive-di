// @flow

const refsProxy = {
    get(target: Object, name: string): (el: HTMLElement) => void {
        return function setElement(el: HTMLElement): void {
            target[name] = el // eslint-disable-line
        }
    }
}

export default function refsSetter<Refs: {[id: string]: any}>(
    refs: Refs
): {[id: $Keys<Refs>]: (el: HTMLElement) => void} {
    return new Proxy(refs, refsProxy)
}
