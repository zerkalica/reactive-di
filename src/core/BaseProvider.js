/* @flow */

import type {
    Tag,
    Annotation
} from 'reactive-di/i/annotationInterfaces'

import type {
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
    _parents: Array<Provider>;

    constructor(annotation: Ann) {
        this.kind = annotation.kind
        this.annotation = annotation
        this._childs = [this]
        this._parents = [this]
        // this.key = annotation.key || annotation.target
        const fnName: string = getFunctionName(annotation.target);
        this.displayName = this.kind + '@' + fnName
        this.tags = [this.kind, fnName]
        if (annotation.tags) {
            this.tags = this.tags.concat(annotation.tags)
        }
    }

    init(context: Context): void {} // eslint-disable-line

    resolve(): any {}
    reset(): void {}

    getChilds(): Array<Provider> {
        return this._childs
    }

    addChild(child: Provider): void {
        this._childs.push(child)
    }

    getParents(): Array<Provider> {
        return this._parents
    }

    addParent(parent: Provider): void {
        this._parents.push(parent)
    }
}
