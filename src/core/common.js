// @flow

import type {Key, ArgDep, RegisterDepItem, LifeCycle} from 'reactive-di/interfaces/deps'
import type {IsEqual, Atom} from 'reactive-di/interfaces/atom'
import type {IContext} from 'reactive-di/interfaces/internal'
import type {RawStyleSheet} from 'reactive-di/interfaces/component'

import debugName from 'reactive-di/utils/debugName'
import CustomReflect from 'reactive-di/CustomReflect'
import Updater from 'reactive-di/core/Updater'

export const paramTypesKey: string = 'design:paramtypes'
export const subtypeKey: string = 'design:subtype'
export const metaKey: string = 'rdi:meta'
export const lcKey: string = 'rdi:lcs'

export class ThemeMeta {
    type: 'theme' = 'theme'
}

export interface ComponentMetaRec {
    register?: RegisterDepItem[]
}
export class ComponentMeta {
    type: 'component' = 'component'
    register: ?RegisterDepItem[]

    constructor(rec?: ComponentMetaRec = {}) {
        this.register = rec.register && rec.register.length ? rec.register : null
    }
}
export class AbstractMeta {
    type: 'abstract' = 'abstract'
}

export interface SourceMetaRec {
    key: string;
    construct?: boolean;
}

export class SourceMeta {
    type: 'source' = 'source'
    key: string
    construct: boolean
    constructor(rec: SourceMetaRec) {
        if (!rec.key) {
            throw new Error('@source has no key property')
        }
        this.key = rec.key
        this.construct = rec.construct || false
    }
}
export class ServiceMeta {
    type: 'service' = 'service'
}
export class DerivableMeta {
    type: 'derivable' = 'derivable'
}
export class StatusMeta {
    type: 'status' = 'status'
    updaters: Class<Updater>[]
    constructor(updaters: Class<Updater>[]) {
        this.updaters = updaters
    }
}

export type RdiMeta = ThemeMeta | ComponentMeta | AbstractMeta
    | SourceMeta | ServiceMeta | DerivableMeta | StatusMeta


const gm = CustomReflect.getMetadata

export function isAbstract(key: Key): boolean {
    return typeof key === 'function' && gm(metaKey, key)
}

const defaultArr: ArgDep[] = []
const defaultMeta = new DerivableMeta()

class ThemeLifeCycle {
    onMount(sheet: RawStyleSheet): void {
        sheet.__styles.attach()
    }

    onUpdate(oldSheet: RawStyleSheet, newSheet: RawStyleSheet): void {
        oldSheet.__styles.detach()
        newSheet.__styles.attach()
    }

    onUnmount(sheet: RawStyleSheet): void {
        sheet.__styles.detach()
    }
}

export class InternalLifeCycle<V> {
    _count: number = 0
    _entity: V
    _lc: LifeCycle<V>

    isEqual: ?IsEqual<*>

    constructor(lc: LifeCycle<V>) {
        this._lc = lc
        this.isEqual = lc.isEqual
            ? (a: V, b: V) => {
                // @todo remove b.equals after fixing https://github.com/ds300/derivablejs/issues/52
                return b.equals ? true : (lc: any).isEqual(a, b)
            }
            : null
    }

    onUpdate: (newValue: V) => void = (newValue: V) => this._onUpdate(newValue)

    _onUpdate(newValue: V): void {
        const oldValue: V = this._entity
        if (oldValue && this._lc.onUpdate && oldValue !== newValue) {
            this._lc.onUpdate(oldValue, newValue)
        }
        this._entity = newValue
    }

    onWillMount() {
        if (this._lc.onWillMount) {
            this._lc.onWillMount(this._entity)
        }
    }

    onMount() {
        this._count = this._count + 1
        if (this._count === 1 && this._lc.onMount) {
            this._lc.onMount(this._entity)
        }
    }

    onUnmount(): void {
        if (this._count === 0) {
            return
        }
        this._count = this._count - 1
        if (this._count === 0 && this._lc.onUnmount) {
            this._lc.onUnmount(this._entity)
        }
    }
}

export function isComponent(target: Function): boolean {
    return typeof target === 'function' && gm(subtypeKey, target)
}

export class DepInfo<V, M> {
    target: Function
    deps: ArgDep[]
    meta: M & {type: any}
    isFactory: boolean
    name: string
    key: Key
    lc: ?Class<LifeCycle<*>>

    ctx: IContext
    lcs: InternalLifeCycle<any>[]
    value: ?Atom<V>
    resolving: boolean

    constructor(target: Function, key: Key, ctx: IContext) {
        this.target = target
        this.key = key
        this.name = debugName(key)
        this.lc = gm(lcKey, target) || null
        this.deps = gm(paramTypesKey, target) || defaultArr

        const meta = gm(metaKey, target)
        const subType: ?string = gm(subtypeKey, target)
        if (subType === 'jsx' && !meta) {
            this.meta = (new ComponentMeta(): any)
        } else {
            this.meta = meta || (defaultMeta: any)
        }
        this.isFactory = subType === 'func'

        if (this.meta.type === 'theme') {
            this.lc = ThemeLifeCycle
        }
        this.ctx = ctx
        this.lcs = []
        this.value = null
        this.resolving = false
    }
}

export interface IHandler {
    handle(info: DepInfo<*, *>): Atom<*>;
}
