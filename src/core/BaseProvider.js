/* @flow */

import type {
    Tag,
    Annotation,
    Provider,
    Container
} from 'reactive-di'
import getFunctionName from 'reactive-di/utils/getFunctionName'

export default class BaseProvider<P: Provider> {
    displayName: string;
    tags: Array<Tag>;
    isDisposed: boolean;
    isCached: boolean;
    dependencies: Array<P>;

    constructor(
        annotation: Annotation,
        container: Container
    ) {
        this.dependencies = [(this: any)]
        this.isCached = false
        this.isDisposed = false
        this.displayName =
            annotation.displayName || (annotation.kind + '@' + getFunctionName(annotation.target))
        this.tags = annotation.tags || []
        container.beginInitialize(annotation.target, ((this: any): Provider))
    }

    dispose(): void {}
    update(): void {}
    addDependency(dependency: P): void {
        dependency.addDependant((this: any))
    }
    addDependant(dependant: P): void {} // eslint-disable-line
}
