/* @flow */
import type {ComposeAnnotation} from 'reactive-di/i/pluginsInterfaces'
import type {
    Tag,
    Container,
    ArgumentHelper,
    Provider
} from 'reactive-di/i/coreInterfaces'

import BaseProvider from 'reactive-di/core/BaseProvider'

class ComposeProvider extends BaseProvider<ComposeAnnotation> {
    kind: 'compose';
    displayName: string;
    tags: Array<Tag>;
    annotation: ComposeAnnotation;
    isCached: boolean;
    _value: any;

    init(container: Container): void {
        const helper: ArgumentHelper = container.createArgumentHelper(this.annotation);
        this._value = function getValue(...args: Array<any>): any {
            return helper.invokeComposed(args)
        }
    }

    addDependency(dependency: Provider): void {
        this.dependencies.push(dependency)
    }

    get(): any {
        return this._value
    }
}

export default {
    kind: 'compose',
    create(annotation: ComposeAnnotation): Provider<ComposeAnnotation> {
        return new ComposeProvider(annotation)
    }
}
