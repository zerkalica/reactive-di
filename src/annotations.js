// @flow

export type Dep<V> = ((...a: any) => V)|Class<V>
export type DepDict = {[k: string]: Dep<any>}
export type ArgDep = Dep<any>

export type DepAlias = [Dep<*>, Dep<*>]
export type RegisterDepItem = Dep<*>

export const paramTypesKey: Symbol = Symbol.for('design:paramtypes')
export const metaKey: Symbol = Symbol.for('rdi:meta')

export type InitData<V> = [V, ?(Promise<V>|Observable<V, Error>)]
export type Initializer<V> = (...x: any[]) => InitData<V>

export class RdiMeta {
    key: ?string = null;
    construct: boolean = false;

    isDerivable: boolean = false;
    initializer: ?Dep<Initializer<*>> = null;
    isComponent: boolean = false;
    localDeps: ?RegisterDepItem[] = null;
    isFactory: boolean = false;
}

export function getMeta<V: Function>(target: V): RdiMeta {
    let meta: ?RdiMeta = target[metaKey]
    if (!meta) {
        meta = target[metaKey] = new RdiMeta()
    }
    return meta
}

export function component<V: Function>(localDeps?: ArgDep[]): (target: V) => V {
    return (target: V) => {
        const meta = getMeta(target)
        if (localDeps) {
            meta.localDeps = localDeps
        }
        meta.isComponent = true
        return target
    }
}

export function init<V, R: Class<V>>(initializer?: Initializer<V>): (target: R) => R {
    return (target: R) => {
        const meta = getMeta(target)
        meta.initializer = initializer
        return target
    }
}

export function deps<V: Function>(args?: ArgDep[]): (target: V) => V {
    return (target: V) => {
        if (args) {
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

export function key<V: Function>(k: string, construct?: boolean): (target: V) => V {
    return (target: V) => {
        const meta = getMeta(target)
        meta.key = k
        meta.construct = construct || false
        return target
    }
}

export function derivable<V: Function>(target: V): V {
    getMeta(target).isDerivable = true
    return target
}
