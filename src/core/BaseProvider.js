/* @flow */

import type {
    Tag,
    Annotation
} from 'reactive-di/i/annotationInterfaces'

import type {
    Resolver,
    Context,
    Provider
} from 'reactive-di/i/nodeInterfaces'

import getFunctionName from 'reactive-di/utils/getFunctionName'

export default class BaseProvider<Ann: Annotation> {
    kind: any;
    displayName: string;
    tags: Array<Tag>;
    annotation: Ann;

    _childs: Array<Provider>;

    constructor(annotation: Ann) {
        this.kind = annotation.kind
        this.annotation = annotation
        this._childs = []
        // this.key = annotation.key || annotation.target
        const fnName: string = getFunctionName(annotation.target);
        this.displayName = this.kind + '@' + fnName
        this.tags = [this.kind, fnName]
        if (annotation.tags) {
            this.tags = this.tags.concat(annotation.tags)
        }
    }

    getChilds(): Array<Provider> {
        return this._childs
    }

    canAddToParent(parent: Provider): boolean { // eslint-disable-line
        return true
    }

    init(context: Context): void {} // eslint-disable-line

    addChild(child: Provider): void {
        this._childs.push(child)
    }

    createResolver(): Resolver {
        throw new Error('Implement Resolver')
    }
}
