/* @flow */

import ClassAnnotationImpl from './plugins/class/ClassAnnotationImpl'
import FactoryAnnotationImpl from './plugins/factory/FactoryAnnotationImpl'
import LoaderAnnotationImpl from './plugins/loader/LoaderAnnotationImpl'
import MetaAnnotationImpl from './plugins/meta/MetaAnnotationImpl'
import SetterAnnotationImpl from './plugins/setter/SetterAnnotationImpl'
import type {
    Deps,
    DepFn,
    Dependency,
    Annotations,
    AnnotationDriver
} from './annotationInterfaces'
import type {Loader} from './plugins/model/modelInterfaces'
import type {Setter} from './plugins/setter/setterInterfaces'
import {
    AsyncModelAnnotationImpl,
    ModelAnnotationImpl
} from './plugins/model/ModelAnnotationImpl'

/* eslint-disable no-undef */

export default function createAnnotations(
    driver: AnnotationDriver,
    tags: Array<string> = []
): Annotations {
    return {
        /* eslint-disable no-unused-vars */
        klass(...deps: Deps): <P: Object>(target: Class<P>) => Class<P> {
            return function _klass<P: Object>(target: Class<P>): Class<P> {
                return driver.set(target, new ClassAnnotationImpl(
                    target,
                    deps,
                    tags
                ))
            }
        },

        factory(...deps: Deps): <T: DepFn>(target: T) => T {
            return function _factory<T: DepFn>(target: T): T {
                return driver.set(target, new FactoryAnnotationImpl(
                    target,
                    deps,
                    tags
                ))
            }
        },

        loader(...deps: Deps): <V: Object, E>(target: Loader<V, E>) => Loader<V, E> {
            return function _loader<V: Object, E>(target: Loader<V, E>): Loader<V, E> {
                return driver.set(target, new LoaderAnnotationImpl(
                    target,
                    deps,
                    tags
                ))
            }
        },

        meta<T: Dependency>(target: T): () => void {
            function dummyTargetId(): void {}
            return driver.set((dummyTargetId: any), new MetaAnnotationImpl(
                target,
                tags
            ))
        },

        model(): <V: Object>(target: Class<V>) => Class<V> {
            return function _model<V: Object>(source: Class<V>): Class<V> {
                return driver.set(source, new ModelAnnotationImpl(
                    source,
                    tags
                ))
            }
        },

        asyncmodel<V: Object, E>(loader?: ?Loader<V, E>): (target: Class<V>) => Class<V> {
            return function _asyncmodel(target: Class<V>): Class<V> {
                return driver.set(target, new ModelAnnotationImpl(
                    target,
                    tags,
                    loader
                ))
            }
        },

        setter<V: Object, E>(model: Class<V>, ...deps: Deps): (target: DepFn<Setter<V>>) => DepFn<Setter<V>> {
            return function _setter(target: DepFn<Setter<V>>): DepFn<Setter<V>> {
                return driver.set(target, new SetterAnnotationImpl(
                    model,
                    target,
                    deps,
                    tags
                ))
            }
        }
        /* eslint-enable no-undef */
    }
}
