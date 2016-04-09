/* @flow */

import type {
    Tag,
    Annotation,
    Resolver,
    Container,
    Provider
} from 'reactive-di/i/coreInterfaces'

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
        const fnName: string = getFunctionName(annotation.target);
        this.displayName = this.kind + '@' + fnName
        this.tags = [this.kind].concat(annotation.tags || [])
    }

    init(Container: Container): void {} // eslint-disable-line

    createResolver(): Resolver {
        throw new Error('Implement resolver')
    }

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
        parent.addChild(this)
        this._parents.push(parent)
    }
}
