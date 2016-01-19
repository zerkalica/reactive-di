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
    ModelDep,
    Notifier,
    DepProcessor,
    ProcessorTypeMap
} from './nodes/nodeInterfaces'
import type {
    DependencyResolver,
    ResolverTypeMap,
    Middlewares
} from './resolver/resolverInterfaces'

import StateMapBuilderImpl from './model/StateMapBuilderImpl'

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

// implements Notifier, ReactiveDi
export default class ReactiveDiImpl {
    _listeners: Array<AnyDep>;
    _depProcessor: DepProcessor;
    _resolver: DependencyResolver;

    constructor(
        driver: AnnotationDriver,
        resolverTypeMap: ResolverTypeMap,
        processorTypeMap: ProcessorTypeMap,
        middlewares: Middlewares,
        state: Object
    ) {
        const stateRef = {state}
        function select(path: Array<string>, fromJS: FromJS) {
            return new ImmutableDataCursor(path, fromJS, stateRef)
        }

        const stateMap: {[id: DepId]: ModelDep} = (new StateMapBuilderImpl(driver)).build(state);
        this._resolver = new AnnotationResolverImpl(driver, resolverTypeMap, middlewares, stateMap)
        this._depProcessor = new DepProcessorImpl(processorTypeMap)
        this._listeners = []
    }

    notify(): void {
        const {_listeners: listeners, _depProcessor: depProcessor} = this
        for (let i = 0, l = listeners.length; i < l; i++) {
            depProcessor.resolve(listeners[i])
        }
    }

    mount<D: ClassDep|FactoryDep>(annotatedDep: Dependency): () => void {
        const dep: D = this._resolver.get(annotatedDep);
        const hooks = dep.hooks
        const self = this

        this._listeners.push(dep)

        hooks.onMount()
        function listenersFilter(registeredDep: D): boolean {
            return dep !== registeredDep
        }
        function unmount() {
            hooks.onUnmount()
            self._listeners = self._listeners.filter(listenersFilter)
        }

        return unmount
    }

    get(annotatedDep: Dependency): any {
        return this._depProcessor.resolve(this._resolver.get(annotatedDep))
    }
}
