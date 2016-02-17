/* @flow */

import Observable from 'zen-observable'

import type {
    AnnotationDriver,
    DepId,
    Dependency,
    Deps,
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
    DepArgs,
    AnnotationResolver,
    ListenerManager,
    ResolvableDep
} from 'reactive-di/i/nodeInterfaces'
import type {FinalizeFn} from 'reactive-di/i/pluginInterfaces'
import type {Plugin} from 'reactive-di/i/pluginInterfaces'

// implements DepArgs
export class DepArgsImpl<M> {
    deps: Array<AnyDep>;
    depNames: ?Array<string>;
    middlewares: ?Array<M>;

    constructor(
        deps: Array<AnyDep>,
        depNames: ?Array<string>,
        middlewares: ?Array<M>
    ) {
        this.deps = deps
        this.depNames = depNames
        this.middlewares = middlewares
    }
}

// implements ListenerManager
class ListenerManagerImpl {
    _listeners: Array<Function>;

    notify: Notify;

    constructor() {
        this._listeners = []
        const self = this
        this.notify = function notify(): void {
            const {_listeners: listeners} = self
            for (let i = 0, l = listeners.length; i < l; i++) {
                listeners[i]();
            }
        }
    }

    add<V, E>(target: ResolvableDep<V>): Observable<V, E> {
        const self = this
        const {base} = target
        function subscriberFn(observer: SubscriptionObserver): Subscription {
            function next(): void {
                if (base.isRecalculate) {
                    observer.next(target.resolve())
                }
            }
            function listenersFilter(dep: Function): boolean {
                return dep !== next
            }
            function unsubscribe(): void {
                self._listeners = self._listeners.filter(listenersFilter)
            }
            self._listeners.push(next)
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

    _middlewares: Map<Dependency|Tag, Array<Dependency>>;
    _overrides: Map<Dependency, Dependency>;

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
        this._middlewares = middlewares
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
            this._middlewares,
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

    _resolveMiddlewares(annotatedDep: Dependency, tags: Array<Tag>): ?Array<AnyDep> {
        const {_middlewares: middlewares} = this
        const ids: Array<Dependency|Tag> = [annotatedDep].concat(tags);
        const middlewareDeps: Array<AnyDep> = [];
        for (let i = 0, l = ids.length; i < l; i++) {
            const depMiddlewares: ?Array<Dependency> = middlewares.get(ids[i]);
            if (depMiddlewares) {
                for (let j = 0, k = depMiddlewares.length; j < k; j++) {
                    middlewareDeps.push(this.resolve(depMiddlewares[j]))
                }
            }
        }

        return middlewareDeps.length ? middlewareDeps : null
    }

    getDeps(deps: ?Deps, annotatedDep: Dependency, tags: Array<Tag>): DepArgs {
        let depNames: ?Array<string> = null;
        const resolvedDeps: Array<AnyDep> = [];
        if (deps && deps.length) {
            if (typeof deps[0] === 'object' && deps.length === 1) {
                depNames = []
                const argsObject: SimpleMap<string, Dependency> =
                    ((deps[0]: any): SimpleMap<string, Dependency>);
                for (let key in argsObject) { // eslint-disable-line
                    resolvedDeps.push(this.resolve(argsObject[key]))
                    depNames.push(key)
                }
            } else {
                for (let i = 0, l = deps.length; i < l; i++) {
                    const dep: AnyDep = this.resolve(((deps: any): Array<Dependency>)[i]);
                    resolvedDeps.push(dep)
                }
            }
        }
        const middlewares: ?Array<AnyDep> = this._resolveMiddlewares(annotatedDep, tags);

        return new DepArgsImpl(resolvedDeps, depNames, middlewares)
    }
}
