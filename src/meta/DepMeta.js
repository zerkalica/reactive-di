/* @flow */

import getFunctionName from '../utils/getFunctionName'

function defaultFn() {}

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
}

type DepMetaRec = {
    fn?: Function;
    depNames?: ?Array<string>;
    tags?: Array<string>;
    isCacheRec?: boolean;
}
