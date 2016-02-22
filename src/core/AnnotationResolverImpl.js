/* @flow */

import Observable from 'zen-observable'

import type {
    AnnotationDriver,
    DepId,
    Dependency,
    AnyAnnotation,
    Tag
} from 'reactive-di/i/annotationInterfaces'
import type {
    Notify,
    SimpleMap,
    CursorCreator
} from 'reactive-di/i/modelInterfaces'
import type {
    AnyDep,
    AnnotationResolver,
    ListenerManager,
    ResolvableDep
} from 'reactive-di/i/nodeInterfaces'
import type {FinalizeFn} from 'reactive-di/i/pluginInterfaces'
import type {Plugin} from 'reactive-di/i/pluginInterfaces'

type Listener<V, E> = {
    observers: Array<Observer<V, E>>;
    target: ResolvableDep<V>;
};
// implements ListenerManager
class ListenerManagerImpl {
    _listeners: Array<Listener>;

    notify: Notify;

    constructor() {
        this._listeners = []
        const self = this
        this.notify = function notify(): void {
            const {_listeners: listeners} = self
            for (let i = 0, l = listeners.length; i < l; i++) {
                const {observers, target} = listeners[i]
                if (target.base.isRecalculate) {
                    for (let j = 0, k = observers.length; j < k; j++) {
                        observers[j].next(target.resolve())
                    }
                }
            }
        }
    }

    add<V, E>(target: ResolvableDep<V>): Observable<V, E> {
        const self = this
        const observers: Array<Observer<V, E>> = [];
        const listener: Listener = {
            observers,
            target
        }
        self._listeners.push(listener)

        function subscriberFn(observer: SubscriptionObserver): Subscription {
            function listenersFilter(dep: SubscriptionObserver): boolean {
                return dep !== observer
            }
            function unsubscribe(): void {
                listener.observers = listener.observers.filter(listenersFilter)
            }
            listener.observers.push(observer)
            return {unsubscribe}
        }

        return new Observable(subscriberFn)
    }
}

// implements AnnotationResolver
export default class AnnotationResolverImpl {
    _driver: AnnotationDriver;
    _parents: Array<Set<DepId>>;
    _cache: SimpleMap<DepId, AnyDep>;
    _plugins: SimpleMap<string, Plugin>;

    _overrides: Map<Dependency, Dependency>;

    middlewares: Map<Dependency|Tag, Array<Dependency>>;
    createCursor: CursorCreator;
    listeners: ListenerManager;

    constructor(
        driver: AnnotationDriver,
        middlewares: Map<Dependency|Tag, Array<Dependency>>,
        overrides: Map<Dependency, Dependency>,
        createCursor: CursorCreator,
        plugins: SimpleMap<string, Plugin>,
        listeners?: ListenerManager,
        cache?: SimpleMap<DepId, AnyDep>
    ) {
        this._driver = driver
        this.middlewares = middlewares
        this._overrides = overrides
        this.createCursor = createCursor
        this._parents = []
        this._plugins = plugins
        this._cache = cache || Object.create(null)
        this.listeners = listeners || new ListenerManagerImpl()
    }

    newRoot(): AnnotationResolver {
        return new AnnotationResolverImpl(
            this._driver,
            this.middlewares,
            this._overrides,
            this.createCursor,
            this._plugins,
            this.listeners,
            this._cache
        )
    }

    begin(dep: AnyDep): void {
        this._parents.push(new Set())
        this._cache[dep.base.id] = dep
    }

    end<T: AnyDep>(dep: T): void {
        const {_parents: parents, _cache: cache} = this
        const depSet: Set<DepId> = parents.pop();
        const {relations} = dep.base
        const iterateFn: FinalizeFn<T> = this._plugins[dep.kind].finalize;

        function iteratePathSet(relationId: DepId): void {
            const target: AnyDep = cache[relationId];
            relations.push(relationId)
            iterateFn(dep, target)
        }
        depSet.forEach(iteratePathSet)
    }

    addRelation(id: DepId): void {
        const {_parents: parents} = this
        for (let i = 0, l = parents.length; i < l; i++) {
            parents[i].add(id)
        }
    }

    resolveAnnotation(annotation: AnyAnnotation): AnyDep {
        function dummyDependency(): void {}
        return this.resolve(this._driver.annotate(dummyDependency, annotation))
    }

    resolve(annotatedDep: Dependency): AnyDep {
        const {_parents: parents} = this
        let annotation: AnyAnnotation = this._driver.getAnnotation(annotatedDep);
        const {base} = annotation
        let dep: AnyDep = this._cache[base.id];
        if (!dep) {
            const overridedDep: ?Dependency = this._overrides.get(annotatedDep);
            if (overridedDep) {
                annotation = this._driver.getAnnotation(overridedDep)
                annotation.base.id = base.id
            }
            const plugin: Plugin = this._plugins[annotation.kind];
            if (!plugin) {
                throw new Error(
                    `Plugin not found for annotation ${annotation.base.info.displayName}`
                )
            }
            plugin.create(annotation, (this: AnnotationResolver))
            dep = this._cache[base.id]
        } else if (parents.length) {
            const {relations} = dep.base
            for (let j = 0, k = parents.length; j < k; j++) {
                const parent: Set<DepId> = parents[j];
                for (let i = 0, l = relations.length; i < l; i++) {
                    parent.add(relations[i])
                }
            }
        }

        return dep
    }
}
