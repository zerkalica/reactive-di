/* @flow */

import {
    createHooks,
    createClassAnnotation,
    createFactoryAnnotation,
    createMetaAnnotation,
    createModelAnnotation,
    createSetterAnnotation
} from './annotationCreators'
import type {
    Deps,
    Hooks,
    IAnnotations,
    AnnotationDriver,
    AnyAnnotation
} from './annotationInterfaces'
/* eslint-disable no-undef */

export default function createAnnotations(driver: AnnotationDriver, tags: Array<string> = []): IAnnotations {
    return {
        klass<T: Object>(...deps: Deps): (target: Class<T>) => T {
            return function _factory(target: Class<T>): T {
                return driver.set(target, createClassAnnotation(
                    target,
                    tags,
                    deps,
                    null
                ))
            }
        },

        factory<T: Function>(...deps: Deps): (target: T) => T {
            return function _factory(target: T): T {
                return driver.set(target, createFactoryAnnotation(
                    target,
                    tags,
                    deps,
                    null
                ))
            }
        },

        meta<T>(source: Class<T>): T {
            function dummyTargetId() {}
            return driver.set(dummyTargetId, createMetaAnnotation(
                source,
                tags
            ))
        },

        model<T>(source: Class<T>): T {
            return driver.set(source, createModelAnnotation(
                source,
                tags
            ))
        },

        setter<T: Function, M: Object>(model: Class<M>, ...deps: Deps): (target: T) => T {
            return function _setter(target: T): T {
                return driver.set(target, createSetterAnnotation(
                    target,
                    model,
                    tags,
                    deps,
                    null
                ))
            }
        },

        hooks<T: Function>(hooks: Hooks): (target: T) => T {
            return function _hooks(target: T): T {
                const annotation: AnyAnnotation = driver.get(target);
                if (
                    !annotation
                    || annotation.kind !== 2
                    || annotation.kind !== 3
                    || annotation.kind !== 5
                ) {
                    throw new Error('Not an annotation given for hook')
                }
                annotation.hooks = createHooks(hooks)
                return target
            }
        }
        /* eslint-enable no-undef */
    }
}
