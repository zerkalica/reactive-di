/* @flow */

import type {DepId, OnUpdateHook} from '../interfaces'
import getFunctionName from '../utils/getFunctionName'
import CacheRec from '../CacheRec'
import EntityMeta from './EntityMeta'
import merge from '../utils/merge'

let id: number = 0;

export function createId(): DepId {
    return '' + (++id)
}

export type FromCacheRec<T> = (rec: CacheRec) => T;

export function getValue(rec: CacheRec): any {
    return rec.value
}

export function getCacheRec(rec: CacheRec): any {
    return rec
}

export function getMeta(rec: CacheRec): EntityMeta {
    return rec.meta
}

function defaultFn() {}

export default class DepMeta {

    id: DepId;
    displayName: string;
    fn: Function;

    deps: Array<DepMeta>;
    depNames: ?Array<string>;
    tags: Array<string>;
    onUpdate: OnUpdateHook;
    fromCacheRec: FromCacheRec;

    constructor(rec: DepMetaRec) {
        this.id = rec.id || createId()
        this.tags = rec.tags || []
        this.fn = rec.fn || defaultFn
        this.displayName = this.tags.join('@') || getFunctionName(this.fn)

        this.deps = rec.deps || []
        this.depNames = rec.depNames || []

        this.onUpdate = rec.onUpdate || defaultFn
        this.fromCacheRec = rec.fromCacheRec || getValue
    }

    copy(rec: DepMetaRec = {}): DepMeta {
        return merge(this, rec)
    }
}

type DepMetaRec = {
    id?: DepId;
    fn?: Function;
    deps?: Array<DepMeta>;
    depNames?: ?Array<string>;
    tags?: Array<string>;
    onUpdate?: OnUpdateHook;
    fromCacheRec?: FromCacheRec
}
