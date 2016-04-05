/* @flow */

import type {
    Dependency,
    Tag,
    Annotation
} from 'reactive-di/i/annotationInterfaces'

import type {
    ResolverCreator
} from 'reactive-di/i/nodeInterfaces'

import getFunctionName from 'reactive-di/utils/getFunctionName'

export default class BaseResolverCreator {
    kind: any;
    displayName: string;
    tags: Array<Tag>;
    childs: Set<ResolverCreator>;
    target: Dependency;

    constructor(annotation: Annotation) {
        this.kind = annotation.kind
        this.childs = new Set()
        this.target = annotation.target
        const fnName: string = getFunctionName(annotation.target);
        this.displayName = this.kind + '@' + fnName
        this.tags = [this.kind, fnName]
    }
}
