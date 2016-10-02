// @flow

export function shallowStrictEqual(objA: ?Object, objB: Object): boolean {
    if (objA === objB) {
        return true
    }

    if ((!objA && objB) || (objA && !objB)) {
        return false
    }

    for (let k in objA) { // eslint-disable-line
        if (objA[k] !== objB[k]) {
            return false
        }
    }
    return true
}

export default function shallowEqual(objA: Object, objB: Object): boolean {
    if (objA === objB) {
        return true
    }

    if ((!objA && objB) || (objA && !objB)) {
        return false
    }

    let k: string

    let numA: number = 0
    let numB: number = 0
    for (k in objA) { // eslint-disable-line
        numA++ // eslint-disable-line
        if (objA[k] !== objB[k]) {
            return false
        }
    }
    for (k in objB) { // eslint-disable-line
        numB++ // eslint-disable-line
    }

    return numA === numB
}
