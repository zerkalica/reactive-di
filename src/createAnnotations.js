/* @flow */

import AsyncModelAnnotationImpl from 'reactive-di/plugins/asyncmodel/AsyncModelAnnotationImpl'
import ClassAnnotationImpl from 'reactive-di/plugins/class/ClassAnnotationImpl'
import DefaultIdCreator from 'reactive-di/core/DefaultIdCreator'
import FactoryAnnotationImpl from 'reactive-di/plugins/factory/FactoryAnnotationImpl'
import GetterAnnotationImpl from 'reactive-di/plugins/getter/GetterAnnotationImpl'
import LoaderAnnotationImpl from 'reactive-di/plugins/loader/LoaderAnnotationImpl'
import MetaAnnotationImpl from 'reactive-di/plugins/meta/MetaAnnotationImpl'
import ModelAnnotationImpl from 'reactive-di/plugins/model/ModelAnnotationImpl'
import ObservableAnnotationImpl from 'reactive-di/plugins/observable/ObservableAnnotationImpl'
import ResetAnnotationImpl from 'reactive-di/plugins/loader/ResetAnnotationImpl'
import SetterAnnotationImpl from 'reactive-di/plugins/setter/SetterAnnotationImpl'
import type {
    IdCreator,
    DepItem,
    DepFn,
    Dependency,
    AnnotationDriver,
    AnyAnnotation
} from 'reactive-di/i/annotationInterfaces'
import type {
    AsyncUpdater,
    AnyUpdater
} from 'reactive-di/plugins/asyncmodel/asyncmodelInterfaces'

/* eslint-disable no-undef */

export type Annotations = {
    klass(...deps: Array<DepItem>): <P: Object>(target: Class<P>) => Class<P>;
    factory(...deps: Array<DepItem>): <T: DepFn>(target: T) => T;
    getter<V: Object>(target: Class<V>): Class<V>;
    meta<T: Dependency>(target: T): () => void;
    model<V: Object>(target: Class<V>): Class<V>;
    asyncmodel<V: Object>(target: Class<V>): Class<V>;
    observable<V>(...deps: Array<DepItem>): (target: Dependency<V>) => Dependency<V>;
    setter<V: Object, E>(model: Class<V>, ...deps: Array<DepItem>)
        : (target: AnyUpdater<V, E>) => AnyUpdater<V, E>;
    loader<V: Object, E>(model: Class<V>, ...deps: Array<DepItem>)
        : (target: AsyncUpdater<V, E>) => AsyncUpdater<V, E>;
}

export default function createAnnotations(
    driver: AnnotationDriver,
    ids: IdCreator = new DefaultIdCreator(),
    tags: Array<string> = []
): Annotations {
    if (!driver) {
        throw new TypeError('Provide AnnotationDriver')
    }
    return {
        /* eslint-disable no-unused-vars */
        klass(...deps: Array<DepItem>): <P: Object>(target: Class<P>) => Class<P> {
            return function _klass<P: Object>(target: Class<P>): Class<P> {
                return driver.annotate(target, new ClassAnnotationImpl(
                    ids.createId(),
                    target,
                    deps,
                    tags
                ))
            }
        },

        factory(...deps: Array<DepItem>): <T: DepFn>(target: T) => T {
            return function _factory<T: DepFn>(target: T): T {
                return driver.annotate(target, new FactoryAnnotationImpl(
                    ids.createId(),
                    target,
                    deps,
                    tags
                ))
            }
        },

        meta<T: Dependency>(target: T): () => void {
            function dummyTargetId(): void {}
            const anyAnnotation: AnyAnnotation = driver.getAnnotation(target);
            return driver.annotate((dummyTargetId: any), new MetaAnnotationImpl(
                anyAnnotation.base.id + '.meta',
                target,
                tags
            ))
        },

        observable<V>(...deps: Array<DepItem>): (target: Dependency<V>) => Dependency<V> {
            return function _observable(target: Dependency<V>): Dependency<V> {
                function pass<P: any>(v: P): P {
                    return v
                }
                return driver.annotate(target, new ObservableAnnotationImpl(
                    ids.createId(),
                    pass,
                    deps,
                    tags
                ))
            }
        },

        getter<V: Object>(target: Class<V>): Class<V> {
            function dummyTargetId(): void {}
            const modelAnnotation: AnyAnnotation = driver.getAnnotation(target);
            if (
                modelAnnotation.kind !== 'model'
                && modelAnnotation.kind !== 'asyncmodel'
            ) {
                throw new Error('Target '
                    + modelAnnotation.base.info.displayName
                    + ' is not a model: ' + modelAnnotation.kind
                )
            }
            return driver.annotate((dummyTargetId: any), new GetterAnnotationImpl(
                modelAnnotation.base.id + '.getter',
                target,
                tags
            ))
        },

        model<V: Object>(target: Class<V>): Class<V> {
            return driver.annotate(target, new ModelAnnotationImpl(
                ids.createId(),
                target,
                tags
            ))
        },

        asyncmodel<V: Object>(target: Class<V>): Class<V> {
            return driver.annotate(target, new AsyncModelAnnotationImpl(
                ids.createId(),
                target,
                tags
            ))
        },

        setter<V: Object, E>(model: Class<V>, ...deps: Array<DepItem>)
            : (target: AnyUpdater<V, E>) => AnyUpdater<V, E> {
            return function _setter(target: AnyUpdater<V, E>): AnyUpdater<V, E> {
                return driver.annotate(target, new SetterAnnotationImpl(
                    ids.createId(),
                    model,
                    target,
                    deps,
                    tags
                ))
            };
        },

        loader<V: Object, E>(model: Class<V>, ...deps: Array<DepItem>)
            : (target: AsyncUpdater<V, E>) => AsyncUpdater<V, E> {
            return function _loader(target: AsyncUpdater<V, E>): AsyncUpdater<V, E> {
                return driver.annotate(target, new LoaderAnnotationImpl(
                    ids.createId(),
                    target,
                    model,
                    deps,
                    tags
                ))
            };
        },

        reset<T: Dependency>(target: T): () => void {
            function dummyTargetId(): void {}
            const loaderAnnotation: AnyAnnotation = driver.getAnnotation(target);
            return driver.annotate((dummyTargetId: any), new ResetAnnotationImpl(
                loaderAnnotation.base.id + '.reset',
                target,
                tags
            ))
        }
        /* eslint-enable no-undef */
    }
}
