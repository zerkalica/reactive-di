// @flow
import type {DepFn, DepDict, ArgDep, DepAlias, RegisterDepItem, InitData, Initializer} from './interfaces'

export const paramTypesKey: Symbol = Symbol.for('design:paramtypes')
export const metaKey: Symbol = Symbol.for('rdi:meta')

export class RdiMeta<V> {
    key: ?string = null;
    construct: boolean = false;
    isTheme: boolean = false;
    isService: boolean = false;
    initializer: ?Initializer<V> = null;
    isComponent: boolean = false;
    localDeps: ?RegisterDepItem[] = null;
    isFactory: boolean = false;
}

export function getMeta<V: Function>(target: V): RdiMeta<*> {
    let meta: ?RdiMeta<*> = target[metaKey]
    if (!meta) {
        meta = target[metaKey] = new RdiMeta()
    }
    return meta
}

export function component<V: Function>(localDeps?: RegisterDepItem[]): (target: V) => V {
    return (target: V) => {
        const meta = getMeta(target)
        if (localDeps) {
            meta.localDeps = localDeps
        }
        meta.isComponent = true
        return target
    }
}

export function deps<V: Function>(...args: ArgDep[]): (target: V) => V {
    return (target: V) => {
        if (args.length) {
            target[paramTypesKey] = args
        }
        return target
    }
}

export function klass<V, R: Class<V>>(target: R): R {
    getMeta(target)
    return target
}

export function factory<V: Function>(target: V): V {
    getMeta(target).isFactory = true
    return target
}

export function theme<V: Function>(target: V): V {
    getMeta(target).isTheme = true
    return target
}

export function source<R, V: Class<R>>(rec: {
    key: string,
    init?: ?Initializer<R>,
    construct?: boolean
}): (target: V) => V {
    return (target: V) => {
        const meta = getMeta(target)
        meta.key = rec.key
        meta.isService = true
        meta.initializer = rec.init || null
        meta.construct = rec.construct || false
        return target
    }
}

export function service<V: Function>(target: V): V {
    getMeta(target).isService = true
    return target
}
