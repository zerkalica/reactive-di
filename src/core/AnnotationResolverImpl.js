/* @flow */

import Observable from 'zen-observable'
import getFunctionName from 'reactive-di/utils/getFunctionName'

import type {
    IdCreator,
    Annotation,
    DepId,
    Dependency,
    Tag,
    AnnotationMap
} from 'reactive-di/i/annotationInterfaces'
import type {
    Notify,
    SimpleMap,
    CursorCreator
} from 'reactive-di/i/modelInterfaces'
import type {
    AnnotationResolver,
    ListenerManager,
    ResolvableDep
} from 'reactive-di/i/nodeInterfaces'
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
                    const data = target.resolve()
                    for (let j = 0, k = observers.length; j < k; j++) {
                        observers[j].next(data)
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
        };
        self._listeners.push(listener)

        function subscriberFn(observer: SubscriptionObserver): () => void {
            function listenersFilter(dep: SubscriptionObserver): boolean {
                return dep !== observer
            }
            function unsubscribe(): void {
                listener.observers = listener.observers.filter(listenersFilter)
            }
            listener.observers.push(observer)
            return unsubscribe
        }

        return new Observable(subscriberFn)
    }
}

type CacheMap<Dep> = SimpleMap<DepId, Dep>;

// implements AnnotationResolver
export default class AnnotationResolverImpl {
    _parents: Array<Set<DepId>>;
    _cache: CacheMap;
    _plugins: SimpleMap<string, Plugin>;
    _idCreator: IdCreator;
    _deps: AnnotationMap;

    middlewares: Map<Dependency|Tag, Array<Dependency>>;
    createCursor: CursorCreator;
    listeners: ListenerManager;

    constructor(
        middlewares: Map<Dependency|Tag, Array<Dependency>>,
        deps: AnnotationMap,
        createCursor: CursorCreator,
        plugins: SimpleMap<string, Plugin>,
        idCreator: IdCreator,
        listeners?: ListenerManager,
        cache?: CacheMap
    ) {
        this.middlewares = middlewares
        this._deps = deps
        this.createCursor = createCursor
        this._parents = []
        this._plugins = plugins
        this._idCreator = idCreator
        this._cache = cache || {}
        this.listeners = listeners || new ListenerManagerImpl()
    }

    newRoot(): AnnotationResolver {
        return new AnnotationResolverImpl(
            this.middlewares,
            this._deps,
            this.createCursor,
            this._plugins,
            this._idCreator,
            this.listeners,
            this._cache
        )
    }

    begin<Dep: ResolvableDep>(dep: Dep): void {
        this._parents.push(new Set())
        this._cache[dep.base.id] = dep
    }

    end<T: ResolvableDep>(dep: T): void {
        const {_parents: parents, _cache: cache} = this
        const depSet: Set<DepId> = parents.pop();
        const {relations} = dep.base
        const plugin: Plugin = this._plugins[dep.kind];

        function iteratePathSet(relationId: DepId): void {
            const target: ResolvableDep = cache[relationId];
            relations.push(relationId)
            plugin.finalize(dep, target)
        }
        depSet.forEach(iteratePathSet)
    }

    addRelation(id: DepId): void {
        const {_parents: parents} = this
        for (let i = 0, l = parents.length; i < l; i++) {
            parents[i].add(id)
        }
    }

    createId(): string {
        return this._idCreator.createId()
    }

    resolveAnnotation<Dep: ResolvableDep>(annotation: Annotation): Dep {
        let dep: ?Dep = this._cache[annotation.id];
        if (!dep) {
            const plugin: ?Plugin = this._plugins[annotation.kind];
            if (!plugin) {
                throw new Error(
                    `Plugin not found for annotation ${getFunctionName(annotation.target)}`
                )
            }
            plugin.create(annotation, (this: AnnotationResolver))
            dep = this._cache[annotation.id]
        } else if (this._parents.length) {
            const {_parents: parents} = this
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

    _getAnnotation(annotatedDep: Dependency): Annotation {
        const annotation: ?Annotation = this._deps.get(annotatedDep);
        if (!annotation) {
            throw new Error(`Can't find annotation for ${getFunctionName(annotatedDep)}`)
        }

        return annotation
    }

    resolve<Dep: Object>(annotatedDep: Dependency|Annotation): Dep {
        return this.resolveAnnotation(
            typeof annotatedDep === 'object'
            ? annotatedDep
            : this._getAnnotation(annotatedDep)
        )
    }
}
