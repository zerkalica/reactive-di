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
    _dependencies: Array<Provider>;
    _dependants: Array<Provider>;

    constructor(annotation: Ann) {
        this.kind = annotation.kind
        this.annotation = annotation
        this._dependencies = [this]
        this._dependants = [this]
        const fnName: string = getFunctionName(annotation.target);
        this.displayName = this.kind + '@' + fnName
        this.tags = [this.kind].concat(annotation.tags || [])
    }

    init(Container: Container): void {} // eslint-disable-line

    createResolver(): Resolver {
        throw new Error('Implement resolver')
    }

    getDependencies(): Array<Provider> {
        return this._dependencies
    }

    addDependency(dependency: Provider): void {
        dependency.addDependant(this)
        this._dependencies.push(dependency)
    }

    /**
     * All dependants
     */
    getDependants(): Array<Provider> {
        return this._dependants
    }

    addDependant(dependant: Provider): void {
        // console.log('add', this.displayName dependant.displayName)
        this._dependants.push(dependant)
    }
}
