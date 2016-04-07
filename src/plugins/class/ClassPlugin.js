/* @flow */
import type {
    Tag
} from 'reactive-di/i/annotationInterfaces'
import type {ClassAnnotation} from 'reactive-di/i/pluginsInterfaces'
import type {
    Provider,
    Context,
    ResolveDepsResult
} from 'reactive-di/i/nodeInterfaces'

import {createObjectProxy} from 'reactive-di/utils/createProxy'
import {fastCreateObject} from 'reactive-di/utils/fastCall'
import BaseProvider from 'reactive-di/core/BaseProvider'

class ClassProvider extends BaseProvider<ClassAnnotation> {
    kind: 'klass';
    displayName: string;
    tags: Array<Tag>;
    annotation: ClassAnnotation;

    _resolver: () => ResolveDepsResult;
    _target: Dependency;
    _isCached: boolean;
    _value: any;

    init(acc: Context): void {
        this._resolver = acc.createDepResolver(
            this.annotation,
            this.tags
        )
        this._isCached = false
        this._target = this.annotation.target
    }

    reset(): void {
        this._isCached = false
    }

    resolve(): any {
        if (this._isCached) {
            return this._value
        }
        const {deps, middlewares} = this._resolver()
        let object: any;
        object = fastCreateObject(this._target, deps);
        if (middlewares) {
            if (typeof object !== 'object') {
                throw new Error(`No object returns from ${this.displayName}`)
            }
            object = createObjectProxy(object, middlewares)
        }
        this._value = object
        this._isCached = true

        return this._value
    }
}

export default {
    kind: 'klass',
    create(annotation: ClassAnnotation): Provider<ClassAnnotation> {
        return new ClassProvider(annotation)
    }
}
