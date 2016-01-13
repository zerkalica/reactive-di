/* @flow */

import type {DepId, OnUpdateHook} from '../interfaces'
import getFunctionName from '../utils/getFunctionName'
import merge from '../utils/merge'

let id: number = 0;

export function createId(): DepId {
    return '' + (++id)
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
    isCacheRec: boolean;

    constructor(rec: DepMetaRec) {
        this.id = rec.id || createId()
        this.tags = rec.tags || []
        this.fn = rec.fn || defaultFn
        this.displayName = this.tags.join('@') || getFunctionName(this.fn)

        this.deps = rec.deps || []
        this.depNames = rec.depNames || null

        this.onUpdate = rec.onUpdate || defaultFn
        this.isCacheRec = !!rec.isCacheRec
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
    isCacheRec?: boolean
}
