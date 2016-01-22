/* @flow */
/* eslint-disable no-unused-vars */

import AnnotationResolverImpl from './resolver/AnnotationResolverImpl'
import DepProcessorImpl from './nodes/DepProcessorImpl'
import type {DepId, Dependency, AnnotationDriver} from './annotations/annotationInterfaces'
import type {ReactiveDi} from './diInterfaces'
import type {
    AnyDep,
    ClassDep,
    FactoryDep,
    SetterDep,
    LoaderDep,
    ModelDep,
    Notifier,
    DepProcessor,
    ProcessorTypeMap,
    DepSubscriber
} from './nodes/nodeInterfaces'
import type {
    DependencyResolver,
    ResolverTypeMap
} from './resolver/resolverInterfaces'

import PureCursorCreator from './model/PureCursorCreator'

import type {Subscription} from './observableInterfaces'
import type {SimpleMap} from './modelInterfaces'

/* eslint-enable no-unused-vars */

type SubscribableDep = ClassDep|FactoryDep;
// implements Notifier, DepSubscriber
class NotifierImpl {
    _listeners: Array<SubscribableDep>;
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

    subscribe(dep: SubscribableDep): Subscription {
        const self = this
        this._listeners.push(dep)
        function listenersFilter(registeredDep: SubscribableDep): boolean {
            return dep !== registeredDep
        }
        const relations = dep.base.relations
        function unsubscribe() {
            self._listeners = self._listeners.filter(listenersFilter)
        }

        return {unsubscribe}
    }
}

// implements ReactiveDi
export default class ReactiveDiImpl {
    _depProcessor: DepProcessor;
    _resolver: DependencyResolver;
    _subscriber: DepSubscriber;

    constructor(
        driver: AnnotationDriver,
        resolverTypeMap: ResolverTypeMap,
        processorTypeMap: ProcessorTypeMap,
        middlewares: SimpleMap<DepId, Array<Dependency>>,
        state: Object
    ) {
        const cursorCreator = new PureCursorCreator(state)
        this._depProcessor = new DepProcessorImpl(processorTypeMap)
        const notifier: Notifier = this._subscriber = new NotifierImpl(this._depProcessor);

        this._resolver = new AnnotationResolverImpl(
            driver,
            resolverTypeMap,
            middlewares,
            cursorCreator,
            notifier
        )
    }

    subscribe<V: any, E>(annotatedDep: Dependency<V>): Subscription {
        const dep: SubscribableDep = ((this._resolver.get(annotatedDep): any): SubscribableDep);
        return this._subscriber.subscribe(dep)
    }

    get<V: any, E>(annotatedDep: Dependency<V>): V {
        const dep = this._resolver.get(annotatedDep);
        return this._depProcessor.resolve(dep)
    }
}
