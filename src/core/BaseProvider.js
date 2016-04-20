/* @flow */

import type {
    Tag,
    Annotation,
    Container,
    Provider
} from 'reactive-di/i/coreInterfaces'
import getFunctionName from 'reactive-di/utils/getFunctionName'

export default class BaseProvider<V, A: Annotation, P: Provider> {
    kind: any;
    displayName: string;
    tags: Array<Tag>;
    isDisposed: boolean;
    isCached: boolean;
    dependencies: Array<P>;

    value: V;

    constructor(annotation: A) {
        this.kind = annotation.kind
        this.dependencies = [((this: any): P)]
        this.isCached = false
        this.isDisposed = false
        this.value = (null: any)
        this.displayName =
            annotation.displayName || (annotation.kind + '@' + getFunctionName(annotation.target))
        this.tags = annotation.tags || []
    }

    init(annotation: A, container: Container): void {} // eslint-disable-line
    dispose(): void {}
    update(): void {}
    addDependency(dependency: P): void {} // eslint-disable-line
    addDependant(dependant: P): void {} // eslint-disable-line
}
