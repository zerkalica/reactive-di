/* @flow */

import ClassAnnotationImpl from 'reactive-di/plugins/class/ClassAnnotationImpl'
import DefaultIdCreator from 'reactive-di/core/DefaultIdCreator'
import FactoryAnnotationImpl from 'reactive-di/plugins/factory/FactoryAnnotationImpl'
import GetterAnnotationImpl from 'reactive-di/plugins/getter/GetterAnnotationImpl'
import LoaderAnnotationImpl from 'reactive-di/plugins/loader/LoaderAnnotationImpl'
import MetaAnnotationImpl from 'reactive-di/plugins/meta/MetaAnnotationImpl'
import ModelAnnotationImpl from 'reactive-di/plugins/model/ModelAnnotationImpl'
import ObservableAnnotationImpl from 'reactive-di/plugins/observable/ObservableAnnotationImpl'
import ResetAnnotationImpl from 'reactive-di/plugins/loader/ResetAnnotationImpl'
import AsyncSetterAnnotationImpl from 'reactive-di/plugins/setter/AsyncSetterAnnotationImpl'
import SyncSetterAnnotationImpl from 'reactive-di/plugins/setter/SyncSetterAnnotationImpl'

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
    SyncUpdater
} from 'reactive-di/i/plugins/setterInterfaces'

export type Annotations = {
    klass(...deps: Array<DepItem>): <P: Object>(target: Class<P>) => Class<P>;

    factory(...deps: Array<DepItem>): <T: DepFn>(target: T) => T;

    getter<V: Object>(target: Class<V>): Class<V>;

    meta<T: Dependency>(target: T): () => void;

    model<V: Object>(target: Class<V>): Class<V>;

    observable<V>(...deps: Array<DepItem>): (target: Dependency<V>) => Dependency<V>;

    asyncsetter<V: Object, E>(model: Class<V>, ...deps: Array<DepItem>)
        : (target: AsyncUpdater<V, E>) => AsyncUpdater<V, E>;

    syncsetter<V: Object>(model: Class<V>, ...deps: Array<DepItem>)
        : (target: SyncUpdater<V>) => SyncUpdater<V>;

    loader<V: Object, E>(model: Class<V>, ...deps: Array<DepItem>)
        : (target: AsyncUpdater<V, E>) => AsyncUpdater<V, E>;
}

export default function createAnnotations(
    driver: AnnotationDriver,
    tags: Array<string> = []
): Annotations {
    if (!driver) {
        throw new TypeError('Provide AnnotationDriver')
    }
    return {
        /* eslint-disable no-shadow */
        klass(...deps: Array<DepItem>): <P: Object>(target: Class<P>) => Class<P> {
            return function _klass<P: Object>(target: Class<P>): Class<P> {
                return driver.annotate(target, new ClassAnnotationImpl(
                    target,
                    deps,
                    tags
                ))
            }
        },

        factory(...deps: Array<DepItem>): <T: DepFn>(target: T) => T {
            return function _factory<T: DepFn>(target: T): T {
                return driver.annotate(target, new FactoryAnnotationImpl(
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

        asyncsetter<V: Object, E>(model: Class<V>, ...deps: Array<DepItem>)
            : (target: AsyncUpdater<V, E>) => AsyncUpdater<V, E> {
            return function _asyncsetter(target: AsyncUpdater<V, E>): AsyncUpdater<V, E> {
                return driver.annotate(target, new AsyncSetterAnnotationImpl(
                    model,
                    target,
                    deps,
                    tags
                ))
            };
        },

        syncsetter<V: Object>(model: Class<V>, ...deps: Array<DepItem>)
            : (target: SyncUpdater<V>) => SyncUpdater<V> {
            return function _syncsetter(target: SyncUpdater<V>): SyncUpdater<V> {
                return driver.annotate(target, new SyncSetterAnnotationImpl(
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
                target,
                tags
            ))
        }
    }
}
