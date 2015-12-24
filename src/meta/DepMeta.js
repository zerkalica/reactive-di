/* @flow */

import type {DepId, OnUpdateHook} from '../interfaces'
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

    promisedId: ?DepId;

    constructor(rec: DepMetaRec) {
        this.isState = !!rec.setter

        this.id = rec.id || createId()
        this.tags = rec.tags || []
        this.displayName = this.tags.join('@') || getFunctionName(rec.fn)
        this.fn = rec.fn

        this.deps = rec.deps || []
        this.depNames = rec.depNames || []

        this.setter = rec.setter || null
        this.onUpdate = rec.onUpdate || dummyOnUpdate
        this.promisedId = rec.promisedId || null
    }
}

type DepMetaRec = {
    id?: DepId;
    fn: Function;
    deps?: Array<DepMeta>;
    depNames?: ?Array<string>;
    tags?: Array<string>;
    promisedId: DepId;
    setter?: DepMeta;
    onUpdate?: ?OnUpdateHook;
}
