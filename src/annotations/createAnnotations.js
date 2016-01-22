/* @flow */

import {
    HooksImpl,
    LoaderAnnotationImpl,
    ClassAnnotationImpl,
    FactoryAnnotationImpl,
    MetaAnnotationImpl,
    ModelAnnotationImpl,
    SetterAnnotationImpl
} from './annotationImpl'
import type {
    Deps,
    DepFn,
    Loader,
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
        klass(...deps: Deps): <P: Object>(target: Class<P>) => Class<P> {
            return function _klass<P: Object>(target: Class<P>): Class<P> {
                return driver.set(target, new ClassAnnotationImpl(
                    target,
                    tags,
                    deps
                ))
            }
        },

        factory(...deps: Deps): <T: DepFn>(target: T) => T {
            return function _factory<T: DepFn>(target: T): T {
                return driver.set(target, new FactoryAnnotationImpl(
                    target,
                    tags,
                    deps
                ))
            }
        },

        loader(...deps: Deps): <L: Loader>(target: L) => L {
            return function _loader<L: Loader>(target: L): L {
                return driver.set(target, new LoaderAnnotationImpl(
                    target,
                    tags,
                    deps
                ))
            }
        },

        meta<T: Dependency>(source: T): () => void {
            function dummyTargetId(): void {}
            return driver.set((dummyTargetId: any), new MetaAnnotationImpl(
                source,
                tags
            ))
        },

        model(loader?: Loader): <P: Object, T: Class<P>>(target: T) => T {
            return function _model<P: Object, T: Class<P>>(source: T): T {
                return driver.set(source, new ModelAnnotationImpl(source, loader, tags))
            }
        },

        setter<P, M: Class<P>, T: DepFn>(model: M, ...deps: Deps): (target: T) => T {
            return function _setter(target: T): T {
                return driver.set(target, new SetterAnnotationImpl(
                    model,
                    target,
                    deps,
                    tags
                ))
            }
        },

        hooks<T: Dependency>(hooks: HooksRec<T>): (target: T) => T {
            return function _hooks(target: T): T {
                const annotation: ClassAnnotation|FactoryAnnotation = driver.get(target);
                if (annotation && (
                    annotation.kind === 'class'
                    || annotation.kind === 'factory'
                    || annotation.kind === 'setter'
                    || annotation.kind === 'loader'
                )) {
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
