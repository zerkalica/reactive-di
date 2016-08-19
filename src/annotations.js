// @flow
import type {DepFn, Key, DepDict, ArgDep, DepAlias, RegisterDepItem} from './interfaces/deps'
import CustomReflect from './CustomReflect'

export const paramTypesKey: string = 'design:paramtypes'
export const functionTypesKey: string = 'design:function'
export const metaKey: string = 'rdi:meta'

export class RdiMeta<V> {
    key: ?string = null
    construct: boolean = false
    isTheme: boolean = false
    writable: boolean = false
    initializer: ?Key = null
    isComponent: boolean = false
    isUpdater: boolean = false
    deps: ?RegisterDepItem[] = null
    isAbstract: boolean = false
    updaters: ?Key[] = null
}

export function deps<V: Function>(...args: ArgDep[]): (target: V) => V {
    return (target: V) => {
        if (args.length) {
            dm(paramTypesKey, args, target)
        }
        return target
    }
}

export function factory<V: Function>(target: V): V {
    dm(functionTypesKey, true, target)
    return target
}

const dm = CustomReflect.defineMetadata
const gm = CustomReflect.getMetadata

function getMeta<V: Function>(target: V): RdiMeta<*> {
    const meta = new RdiMeta()
    dm(metaKey, meta, target)
    return meta
}

export function component<V: Function>(
    rec?: {
        deps?: RegisterDepItem[]
    } = {}
): (target: V) => V {
    return (target: V) => {
        const meta = getMeta(target)
        if (rec.deps && rec.deps.length) {
            meta.deps = rec.deps
        }
        meta.isComponent = true
        return target
    }
}

export function theme<V: Function>(target: V): V {
    getMeta(target).isTheme = true
    return target
}

export function source<R, V: Class<R>>(rec: {
    key: string,
    init?: ?Key,
    construct?: boolean
}): (target: V) => V {
    return (target: V) => {
        const meta = getMeta(target)
        meta.key = rec.key
        meta.writable = true
        meta.initializer = rec.init || null
        meta.construct = rec.construct || false
        return target
    }
}

export function updaters<V: Function>(...updaters: Key[]): (target: V) => V {
    return (target: V) => {
        getMeta(target).updaters = updaters
        return target
    }
}

export function service<V: Function>(target: V): V {
    getMeta(target).writable = true
    return target
}

export function abstract<V: Function>(target: V): V {
    getMeta(target).isAbstract = true
    return target
}
