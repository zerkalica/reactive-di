// @flow

import type {DepFn, Key, DepDict, ArgDep, DepAlias, RegisterDepItem} from '../interfaces/deps'
import type {Atom, Adapter, CacheMap, Derivable} from '../interfaces/atom'
import debugName from '../utils/debugName'
import CustomReflect from '../CustomReflect'
import Updater from '../Updater'

export const paramTypesKey: string = 'design:paramtypes'
export const functionTypesKey: string = 'design:function'
export const metaKey: string = 'rdi:meta'

export class ThemeMeta {
    type: 'theme' = 'theme'
}

export interface ComponentMetaRec {
    register?: ?RegisterDepItem[]
}
export class ComponentMeta {
    type: 'component' = 'component'
    register: ?RegisterDepItem[]

    constructor(rec: ComponentMetaRec) {
        this.register = rec.register && rec.register.length ? rec.register : null
    }
}
export class AbstractMeta {
    type: 'abstract' = 'abstract'
}

export interface SourceMetaRec {
    key: string;
    construct?: boolean;
    updater?: ?Class<Updater>;
    loader?: Function;
}

export class SourceMeta {
    type: 'source' = 'source'
    key: string
    construct: boolean
    updater: ?Class<Updater>
    loader: ?Key

    constructor(rec: SourceMetaRec) {
        if (!rec.key) {
            throw new Error(`@source has no key property`)
        }
        this.key = rec.key
        this.construct = rec.construct || !!rec.loader || false
        this.updater = rec.updater || null
        this.loader = rec.loader || null
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

export type RdiMeta = ThemeMeta | ComponentMeta | AbstractMeta | SourceMeta | ServiceMeta | DerivableMeta | StatusMeta

const defaultArr: ArgDep[] = []
const gm = CustomReflect.getMetadata

export const defaultMeta: any = new DerivableMeta()

export interface Collector {
    add(info: DepInfo<*>, atom: Atom<*>|Derivable<*>): void;
}

export interface IContext {
    adapter: Adapter;
    cache: CacheMap;
    defaults: {[id: string]: mixed};
    stopped: Atom<boolean>;
    displayName: string;
    resolveDeps(deps: ArgDep[], collector?: Collector): Derivable<mixed[]>;
    debugStr(data: mixed): string;
    val<V>(key: Key, collector?: Collector): Atom<V>;
    preprocess<V: any>(data: V): V;

    create(displayName: string): IContext;
    register(registered?: ?RegisterDepItem[]): IContext;
    getMeta(key: Key): DepInfo<*>;
}

export class DepInfo<Meta> {
    target: Function
    deps: ArgDep[]
    meta: Meta
    isFactory: boolean
    ctx: IContext
    name: string
    key: Key

    constructor(target: Function, key: Key, ctx: IContext) {
        this.target = target
        this.key = key
        this.name = debugName(key)
        this.deps = gm(paramTypesKey, target) || defaultArr
        this.meta = gm(metaKey, target) || defaultMeta
        this.isFactory = gm(functionTypesKey, target) || false
        this.ctx = ctx
    }
}

export function isAbstract(key: Key): boolean {
    return typeof key === 'function' && gm(metaKey, key)
}

export type RdiMetaType = 'theme' | 'component' | 'abstract' | 'source' | 'service' | 'derivable' | 'status'

export interface IHandler<Meta, Result> {
    handle(info: DepInfo<Meta>, collector?: Collector): Result;
    postHandle(info: DepInfo<Meta>, atom: Result): void;
}
