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
    DepSubscriber,
    SubscribableDep
} from './nodes/nodeInterfaces'
import type {
    DependencyResolver,
    ResolverTypeMap
} from './resolver/resolverInterfaces'

import PureCursorCreator from './model/PureCursorCreator'

import type {Subscription} from './observableInterfaces'
import type {SimpleMap} from './modelInterfaces'

/* eslint-enable no-unused-vars */

/*
type MiddlewareMap = {[id: DepId]: Array<CacheRec>};

function normalizeMiddlewares(
    rawMiddlewares: Array<[Dependency, Array<Dependency>]>,
    getDepMeta: (dep: Dependency) => CacheRec
): MiddlewareMap {
    const middlewares: MiddlewareMap = {};
    for (let i = 0, l = rawMiddlewares.length; i < l; i++) {
        const [frm, toDeps] = rawMiddlewares[i]
        const key = getDepMeta(frm).id
        let group = middlewares[key]
        if (!group) {
            group = []
            middlewares[key] = group
        }
        for (let j = 0, k = toDeps.length; j < k; j++) {
            group.push(getDepMeta(toDeps[j]))
        }
    }

    return middlewares
}
*/

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
        function unsubscribe() {
            dep.hooks.onUnmount()
            self._listeners = self._listeners.filter(listenersFilter)
        }
        dep.hooks.onMount()

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
        const dep: SubscribableDep<V, E> = this._resolver.get(annotatedDep);
        return this._subscriber.subscribe(dep)
    }

    get<V: any, E>(annotatedDep: Dependency<V>): V {
        const dep: SubscribableDep<V, E> = this._resolver.get(annotatedDep);
        return this._depProcessor.resolve(dep)
    }
}
