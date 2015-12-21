/* @flow */

import type {DepId, Dependency, OnUpdateHook} from '../interfaces'
import getFunctionName from '../utils/getFunctionName'

const metaSymbol = Symbol('__rdi__meta')

let id: number = 0;

export function createId(): DepId {
    return '' + (++id)
}

function dummyOnUpdate(): void {
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
    onUpdate: OnUpdateHook;

    constructor(rec: DepMetaRec) {
        this.kind = rec.getter ? 'state' : 'func'

        this.id = rec.id || createId()
        this.tags = rec.tags || []
        this.displayName = this.tags.join('@') || getFunctionName(rec.fn)
        this.fn = rec.fn

        this.deps = rec.deps || []
        this.depNames = rec.depNames || []

        this.getter = rec.getter || null
        this.setter = rec.setter || null
        this.onUpdate = rec.onUpdate || dummyOnUpdate
    }

    static isMeta<T: Function>(dep: T): boolean {
        return !!dep[metaSymbol]
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
    fn: Function;
    deps?: Array<DepMeta>;
    depNames?: ?Array<string>;
    tags?: Array<string>;
    getter?: DepMeta;
    setter?: DepMeta;
    onUpdate?: ?OnUpdateHook;
}
