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
    DepFn,
    Dependency,
    Hooks,
    HooksRec,
    IAnnotations,
    AnnotationDriver,
    AnyAnnotation,
    ClassAnnotation,
    FactoryAnnotation
} from './annotationInterfaces'

/* eslint-disable no-undef */

export default function createAnnotations(
    driver: AnnotationDriver,
    tags: Array<string> = []
): IAnnotations {
    return {
        /* eslint-disable no-unused-vars */
        klass<P: Object, T: Class<P>>(...deps: Deps): (target: T) => T {
            return function _factory(target: T): T {
                return driver.set(target, new ClassAnnotationImpl(
                    target,
                    tags,
                    deps
                ))
            }
        },

        factory<A, T: DepFn<A>>(...deps: Deps): (target: T) => T {
            return function _factory(target: T): T {
                return driver.set(target, new FactoryAnnotationImpl(
                    target,
                    tags,
                    deps
                ))
            }
        },

        meta<A: any, T: Dependency<A>>(source: T): () => void {
            function dummyTargetId(): void {}
            return driver.set((dummyTargetId: any), new MetaAnnotationImpl(
                source,
                tags
            ))
        },

        model<P: Object, T: Class<P>, A, L: DepFn<A>>(loader?: L): (target: T) => T {
            return function _model(source: T): T {
                return driver.set(source, new ModelAnnotationImpl(source, loader, tags))
            }
        },

        setter<P: Object, M: Class<P>, A, T: DepFn<A>>(model: M, ...deps: Deps): (target: T) => T {
            return function _setter(target: T): T {
                function setterFacetId() {}
                const facet = driver.set(
                    setterFacetId,
                    new FactoryAnnotationImpl(target, tags, deps)
                )
                return driver.set(target, new SetterAnnotationImpl(model, facet, tags))
            }
        },

        hooks<A: any, T: Dependency<A>>(hooks: HooksRec<T>): (target: T) => T {
            return function _hooks(target: T): T {
                const annotation: ClassAnnotation|FactoryAnnotation<T> = driver.get(target);
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
