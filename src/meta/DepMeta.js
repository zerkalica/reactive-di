/* @flow */

import type {DepId, OnUpdate, OnMount, OnUnmount} from '../interfaces'
import getFunctionName from '../utils/getFunctionName'

export type HooksRec = {
    onUpdate?: OnUpdate;
    onMount?: OnMount;
    onUnmount?: OnUnmount;
}

function defaultFn() {}

export class Hooks {
    onUpdate: OnUpdate;
    onMount: OnMount;
    onUnmount: OnUnmount;

    constructor(rec: HooksRec = {}) {
        this.onUpdate = rec.onUpdate || defaultFn
        this.onMount = rec.onMount || defaultFn
        this.onUnmount = rec.onUnmount || defaultFn
    }
}

export default class DepMeta {
    id: DepId;
    displayName: string;
    fn: Function;

    deps: Array<DepMeta>;
    depNames: ?Array<string>;
    tags: Array<string>;
    hooks: Hooks;
    isCacheRec: boolean;

    constructor(rec: DepMetaRec) {
        if (!rec.id) {
            throw new Error('Id is undefined')
        }
        this.hooks = rec.hooks || new Hooks()
        this.id = rec.id
        this.tags = rec.tags || []
        this.fn = rec.fn || defaultFn
        this.displayName = this.tags.join('@') || getFunctionName(this.fn)

        this.deps = rec.deps || []
        this.depNames = rec.depNames || null
        this.isCacheRec = !!rec.isCacheRec
    }
}

type DepMetaRec = {
    id: DepId;
    hooks?: Hooks;
    fn?: Function;
    deps?: Array<DepMeta>;
    depNames?: ?Array<string>;
    tags?: Array<string>;
    isCacheRec?: boolean;
}
