/* @flow */
import driver from 'reactive-di/pluginsCommon/driver'
import type {DepItem} from 'reactive-di/i/annotationInterfaces'
import type {AsyncUpdater} from 'reactive-di/i/plugins/setterInterfaces'
import type {LoaderAnnotation} from 'reactive-di/i/plugins/loaderInterfaces' // eslint-disable-line

export function loader<V: Object, E>(
    target: AsyncUpdater<V, E>,
    model: Class<V>,
    ...deps: Array<DepItem>
): LoaderAnnotation<V, E> {
    return {
        kind: 'loader',
        id: '',
        model,
        isPending: false,
        target,
        deps
    }
}

export function pendingLoader<V: Object, E>(
    target: AsyncUpdater<V, E>,
    model: Class<V>,
    ...deps: Array<DepItem>
): LoaderAnnotation<V, E> {
    return {
        kind: 'loader',
        id: '',
        model,
        isPending: true,
        target,
        deps
    }
}

export function loaderAnnotation<V: Function, M: Object>(
    model: Class<M>,
    ...deps: Array<DepItem>
): (target: V) => V {
    return function __loader(
        target: V
    ): V {
        return driver.annotate(target, loader(target, model, ...deps))
    }
}

export function pendingLoaderAnnotation<V: Function, M: Object>(
    model: Class<M>,
    ...deps: Array<DepItem>
): (target: V) => V {
    return function __loader(
        target: V
    ): V {
        return driver.annotate(target, loader(target, model, ...deps))
    }
}
