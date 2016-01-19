/* @flow */

import {
    HooksImpl,
    ClassAnnotationImpl,
    FactoryAnnotationImpl,
    MetaAnnotationImpl,
    ModelAnnotationImpl,
    SetterAnnotationImpl
} from './annotationImpl'
import type {
    // Deps,
    Hooks,
    IAnnotations,
    AnnotationDriver,
    AnyAnnotation
} from './annotationInterfaces'

/* eslint-disable no-undef */

export default function createAnnotations(
    driver: AnnotationDriver,
    tags: Array<string> = []
): IAnnotations {
    return {
        klass<T: Function>(...deps: Array<any>): (target: T) => T {
            return function _factory(target: T): T {
                return driver.set(target, new ClassAnnotationImpl(
                    target,
                    tags,
                    deps
                ))
            }
        },

        factory<T: Function>(...deps: Array<any>): (target: T) => T {
            return function _factory(target: T): T {
                return driver.set(target, new FactoryAnnotationImpl(
                    target,
                    tags,
                    deps
                ))
            }
        },

        meta<T: Function>(source: T): Function {
            function dummyTargetId() {}
            return driver.set(dummyTargetId, new MetaAnnotationImpl(
                source,
                tags
            ))
        },

        model<T: Function>(source: T): T {
            return driver.set(source, new ModelAnnotationImpl(source, tags))
        },

        setter<T: Function, M: Object>(model: Class<M>, ...deps: Array<any>): (target: T) => T {
            return function _setter(target: T): T {
                function setterFacetId() {}
                const facet = driver.set(
                    setterFacetId,
                    new FactoryAnnotationImpl(target, tags, deps)
                )
                return driver.set(target, new SetterAnnotationImpl(model, facet, tags))
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
                annotation.hooks = new HooksImpl(hooks)
                return target
            }
        }
        /* eslint-enable no-undef */
    }
}
