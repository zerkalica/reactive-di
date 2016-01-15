/* @flow */

import type {DepId, Dependency} from '../interfaces'
import Hooks from './Hooks'

export type RawDeps = Array<Dependency> | {[prop: string]: Dependency};
export type IDepType = 'model' | 'meta' | 'setter' | 'class' | 'factory';
export type RawDepMetaRec = {
    kind: IDepType;
    deps?: RawDeps;
    hooks?: Hooks;
    setters?: Array<Dependency>;
    tags?: Array<string>;
}

export default class RawDepMeta {
    id: DepId;
    deps: RawDeps;
    tags: Array<string>;

    kind: IDepType;

    // only if kind === 'setter'
    setters: ?Array<Dependency>;

    // only if kind === 'class', 'factory'
    hooks: ?Hooks;

    constructor(rec: RawDepMetaRec) {
        this.kind = rec.kind
        this.tags = rec.tags || []
        this.deps = rec.deps || []
        this.hooks = rec.hooks || null
        this.setters = rec.setters || []
    }
}
