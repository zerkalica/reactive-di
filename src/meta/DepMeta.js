/* @flow */

import getFunctionName from '../utils/getFunctionName'
import RawDepMeta from './RawDepMeta'

function defaultFn() {}

function getter<T: Object>(cacheRec: CacheRec): T {
    return cacheRec.getValue()
}

function proxifyResult<R: Function>(src: R, cacheRec: CacheRec): R {
    return createProxy(src, [cacheRec.setValue])
}

export default class DepMeta {
    displayName: string;
    fn: Function;

    depNames: ?Array<string>;
    tags: Array<string>;
    isCacheRec: boolean;

    constructor(rec: DepMetaRec) {
        this.tags = rec.tags || []
        this.fn = rec.fn || defaultFn
        this.displayName = this.tags.join('@') || getFunctionName(this.fn)

        this.depNames = rec.depNames || null
        this.isCacheRec = !!rec.isCacheRec
    }

    id: DepId;
    deps: RawDeps;
    tags: Array<string>;

    kind: IDepType;

    // only if kind === 'setter'
    setters: ?Array<Dependency>;

    // only if kind === 'class', 'factory'
    hooks: ?Hooks;

    static fromRaw({tags, id, kind, setters, hooks}: RawDepMeta, depNames: ?Array<string>): DepMeta {
        return new DepMeta({
            tags,
            hooks
        })
    }
}

type DepMetaRec = {
    fn?: Function;
    depNames?: ?Array<string>;
    tags?: Array<string>;
    isCacheRec?: boolean;
}
