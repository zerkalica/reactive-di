/* @flow */

import type {
    Tag,
    Annotation,
    Container,
    Provider
} from 'reactive-di/i/coreInterfaces'
import getFunctionName from 'reactive-di/utils/getFunctionName'

export default class BaseProvider<V, Ann: Annotation, P: Provider> {
    kind: any;
    displayName: string;
    tags: Array<Tag>;
    annotation: Ann;
    value: V;
    isDisposed: boolean;
    isCached: boolean;
    dependencies: Array<P>;

    constructor(annotation: Ann) {
        this.annotation = annotation
        this.kind = annotation.kind
        this.dependencies = [((this: any): P)]
        this.isCached = false
        this.isDisposed = false
        this.value = (null: any)
        this.displayName =
            annotation.displayName || (annotation.kind + '@' + getFunctionName(annotation.target))
        this.tags = annotation.tags || []
    }

    init(container: Container): void {} // eslint-disable-line

    dispose(): void {
        this.isDisposed = true
    }

    update(): void {
        this.isCached = true
    }

    addDependency(dependency: P): void {
        const deps = this.dependencies
        const l = deps.length
        deps[l] = dependency
        deps.length = l + 1
        dependency.addDependant(this)
    }

    addDependant(dependant: P): void {} // eslint-disable-line
}
