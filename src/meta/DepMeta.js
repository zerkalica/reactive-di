/* @flow */

import type {DepId, Dependency, OnUpdateHook} from '../interfaces'
import getFunctionName from '../utils/getFunctionName'

let id: number = 0;

export function createId(): DepId {
    return '' + (++id)
}

function dummyOnUpdate(): void {
}

export default class DepMeta {
    isState: boolean;

    id: DepId;
    displayName: string;
    fn: Function;

    deps: Array<DepMeta>;
    depNames: ?Array<string>;
    tags: Array<string>;
    onUpdate: OnUpdateHook;

    setter: ?DepMeta;
    getMeta: ?Dependency;

    constructor(rec: DepMetaRec) {
        this.isState = !!rec.setter

        this.id = rec.id || createId()
        this.tags = rec.tags || []
        this.displayName = this.tags.join('@') || getFunctionName(rec.fn)
        this.fn = rec.fn

        this.deps = rec.deps || []
        this.depNames = rec.depNames || []

        this.setter = rec.setter || null
        this.getMeta = rec.getMeta ? rec.getMeta : null;
        this.onUpdate = rec.onUpdate || dummyOnUpdate
    }
}

type DepMetaRec = {
    id?: DepId;
    fn: Function;
    deps?: Array<DepMeta>;
    depNames?: ?Array<string>;
    tags?: Array<string>;
    setter?: DepMeta;
    getMeta?: Dependency;
    onUpdate?: ?OnUpdateHook;
}
