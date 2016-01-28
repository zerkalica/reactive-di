/* @flow */
/* eslint-disable no-unused-vars */

import AnnotationResolverImpl from './resolver/AnnotationResolverImpl'
import DepProcessorImpl from './nodes/DepProcessorImpl'
import createPureCursorCreator from './model/createPureCursorCreator'
import type {DepId, Dependency, AnnotationDriver} from './annotations/annotationInterfaces'
import type {ReactiveDi} from './diInterfaces'
import type {
    AnyDep,
    Notifier,
    DepProcessor,
    ProcessorTypeMap,
    DepSubscriber
} from './nodes/nodeInterfaces'
import type {
    DependencyResolver,
    ResolverTypeMap
} from './resolver/resolverInterfaces'

import type {Subscription} from './observableInterfaces'
import type {SimpleMap} from './modelInterfaces'

/* eslint-enable no-unused-vars */

// implements Notifier, DepSubscriber
class NotifierImpl {
    _listeners: Array<AnyDep>;
    _depProcessor: DepProcessor;

    constructor(depProcessor: DepProcessor) {
        this._depProcessor = depProcessor
        this._listeners = []
    }

    notify(): void {
        const {_listeners: listeners, _depProcessor: depProcessor} = this
        for (let i = 0, l = listeners.length; i < l; i++) {
            depProcessor.resolve(listeners[i])
        }
    }

    subscribe(dep: AnyDep): Subscription {
        const self = this
        this._listeners.push(dep)
        function listenersFilter(registeredDep: AnyDep): boolean {
            return dep !== registeredDep
        }
        const subscriptions: Array<Subscription> = dep.base.subscriptions;
        function unsubscribe() {
            for (let i = 0, l = subscriptions.length; i < l; i++) {
                subscriptions[i].unsubscribe()
            }
            self._listeners = self._listeners.filter(listenersFilter)
        }

        return {unsubscribe}
    }
}

// implements ReactiveDi
export default class ReactiveDiImpl {
    _depProcessor: DepProcessor;
    _resolver: AnnotationResolver;
    _subscriber: DepSubscriber;

    constructor(
        driver: AnnotationDriver,
        resolverTypeMap: ResolverTypeMap,
        processorTypeMap: ProcessorTypeMap,
        middlewares: SimpleMap<DepId, Array<Dependency>>,
        state: Object
    ) {
        const createCursor: CursorCreator = createPureCursorCreator(state);
        this._depProcessor = new DepProcessorImpl(processorTypeMap)
        const notifier: Notifier = this._subscriber = new NotifierImpl(this._depProcessor);

        this._resolver = new AnnotationResolverImpl(
            driver,
            resolverTypeMap,
            middlewares,
            createCursor,
            notifier
        )
    }

    subscribe<V: any, E>(annotatedDep: Dependency<V>): Subscription {
        const dep: AnyDep = resolve(annotatedDep, this._resolver);
        return this._subscriber.subscribe(dep)
    }

    get<V: any, E>(annotatedDep: Dependency<V>): V {
        const dep = resolve(annotatedDep, this._resolver);
        return this._depProcessor.resolve(dep)
    }
}
