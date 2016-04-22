/* @flow */

import type {
    Tag,
    Annotation,
    Provider,
    Container
} from 'reactive-di/i/coreInterfaces'
import getFunctionName from 'reactive-di/utils/getFunctionName'

export default class BaseProvider {
    displayName: string;
    tags: Array<Tag>;
    isDisposed: boolean;
    isCached: boolean;
    dependencies: Array<Provider>;

    constructor(annotation: Annotation, container: Container) {
        this.dependencies = [(this: any)]
        this.isCached = false
        this.isDisposed = false
        this.displayName =
            annotation.displayName || (annotation.kind + '@' + getFunctionName(annotation.target))
        this.tags = annotation.tags || []
        container.beginInitialize(((this: any): Provider))
    }

    dispose(): void {}
    update(): void {}
    addDependency(dependency: Provider): void {
        dependency.addDependant((this: any))
    }
    addDependant(dependant: Provider): void {} // eslint-disable-line
}
