/* @flow */

import type {
    Tag,
    Annotation,
    Container,
    Provider,
    Collection
} from 'reactive-di/i/coreInterfaces'
import DisposableCollection from 'reactive-di/utils/DisposableCollection'

export default class BaseProvider<Ann: Annotation> {
    kind: any;
    displayName: string;
    tags: Array<Tag>;

    annotation: Ann;

    isDisposed: boolean;
    isCached: boolean;

    dependencies: Array<Provider>;
    dependants: Collection<Provider>;

    constructor(annotation: Ann) {
        this.kind = annotation.kind
        this.annotation = annotation
        this.dependencies = [this]
        this.dependants = new DisposableCollection([this])
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
        this.dependants.add(dependant)
    }
}
