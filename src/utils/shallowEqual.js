// @flow

export function shallowStrictEqual(objA: ?Object, objB: Object): boolean {
    if (objA === objB) {
        return true
    }

    if ((!objA && objB) || (objA && !objB)) {
        return false
    }

    let k: string
    for (k in objA) {
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

    if (!objA && objB || objA && !objB) {
        return false
    }

    let k: string

    let numA: number = 0
    let numB: number = 0
    for (k in objA) {
        numA++
        if (objA[k] !== objB[k]) {
            return false
        }
    }
    for (k in objB) {
        numB++
    }

    return numA === numB
}
