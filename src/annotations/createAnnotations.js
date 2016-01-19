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
    Deps,
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
        klass<T: Function>(...deps: Deps): (target: T) => T {
            return function _factory(target: T): T {
                return driver.set(target, new ClassAnnotationImpl(
                    target,
                    tags,
                    deps
                ))
            }
        },

        factory<T: Function>(...deps: Deps): (target: T) => T {
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

        setter<T: Function, M: Object>(model: Class<M>, ...deps: Deps): (target: T) => T {
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
                if (annotation && (annotation.kind === 'class' || annotation.kind === 'factory')) {
                    annotation.hooks = new HooksImpl(hooks)
                } else {
                    throw new Error('Hook can be applied to class or factory annotation. Given: ' + annotation.kind)
                }

                return target
            }
        }
        /* eslint-enable no-undef */
    }
}
