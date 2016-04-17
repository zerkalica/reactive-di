/* @flow */

import type {
    Tag,
    Annotation,
    Container,
    Provider
} from 'reactive-di/i/coreInterfaces'

export default class BaseProvider<Ann: Annotation> {
    kind: any;
    displayName: string;
    tags: Array<Tag>;

    annotation: Ann;

    isDisposed: boolean;
    isCached: boolean;

    dependencies: Array<Provider>;
    dependants: Array<Provider>;

    constructor(annotation: Ann) {
        this.kind = annotation.kind
        this.annotation = annotation
        this.dependencies = [this]
        this.dependants = [this]
        this.isCached = false
        this.isDisposed = false
        this.displayName = (annotation: any).displayName
        this.tags = (annotation: any).tags
    }

    init(container: Container): void {} // eslint-disable-line

    dispose(): void {
        this.isDisposed = true
    }

    get(): any {
        return null
    }

    addDependency<P: Provider>(dependency: P): void {
        dependency.addDependant(this)
        this.dependencies.push(dependency)
    }

    addDependant<P: Provider>(dependant: P): void {
        this.dependants.push(dependant)
    }
}
