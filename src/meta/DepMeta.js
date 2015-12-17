/* @flow */

import type {DepId, Dependency} from '../interfaces'
import getFunctionName from '../utils/getFunctionName'

const metaSymbol = Symbol('__rdi__meta')

let id: number = 0;

export function createId(): DepId {
    return '' + (++id)
}

export default class DepMeta {
    kind: 'func'|'state';

    id: DepId;
    displayName: string;
    fn: Function;

    deps: Array<DepMeta>;
    depNames: ?Array<string>;
    tags: Array<string>;

    getter: ?DepMeta;
    setter: ?DepMeta;

    constructor(rec: DepMetaRec) {
        this.kind = rec.getter ? 'state' : 'func'

        this.id = rec.id || createId()
        this.displayName = rec.displayName || getFunctionName(rec.fn)
        this.fn = rec.fn

        this.deps = rec.deps || []
        this.depNames = rec.depNames || []
        this.tags = rec.tags || []

        this.getter = rec.getter || null
        this.setter = rec.setter || null
    }

    static set(dep: Dependency, meta: DepMeta): Dependency {
        if ((dep: Function)[metaSymbol]) {
            throw new Error('Annotation already defined for ' + ((dep: Function).displayName || String(dep)))
        }
        (dep: Function)[metaSymbol] = meta
        return dep
    }

    static get(dep: Dependency): DepMeta {
        const meta: DepMeta = (dep: Function)[metaSymbol];
        if (!meta || !(meta instanceof DepMeta)) {
            throw new TypeError('Not an annotated dependency: ' + ((dep: Function).displayName || String(dep)))
        }
        return meta
    }
}

type DepMetaRec = {
    id?: DepId;
    displayName?: string;
    fn: Function;
    deps?: Array<DepMeta>;
    depNames?: ?Array<string>;
    tags?: Array<string>;
    getter?: DepMeta;
    setter?: DepMeta;
}
