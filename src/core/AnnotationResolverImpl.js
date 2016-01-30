/* @flow */

import type {
    AnnotationDriver,
    DepId,
    Dependency,
    Deps,
    AnyAnnotation,
    Tag
} from '../interfaces/annotationInterfaces'
import type {
    Notify,
    SimpleMap,
    CursorCreator
} from '../interfaces/modelInterfaces'
import type {
    AnyDep,
    DepArgs,
    AnnotationResolver
} from '../interfaces/nodeInterfaces'
import type {FinalizeFn, Resolve} from '../interfaces/pluginInterfaces'
import type {Plugin} from '../interfaces/pluginInterfaces'
import {DepArgsImpl} from './DepArgsImpl'

function createResolver(resolve: Resolve, dep: AnyDep, acc: AnnotationResolver): () => void {
    return function resolveDep(): void {
        return resolve(dep, acc)
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

    _lastId: number;

    createCursor: CursorCreator;
    notify: Notify;

    constructor(
        driver: AnnotationDriver,
        middlewares: Map<Dependency|Tag, Array<Dependency>>,
        overrides: Map<Dependency, Dependency>,
        createCursor: CursorCreator,
        notify: Notify,
        plugins: SimpleMap<string, Plugin>,
        cache?: SimpleMap<DepId, AnyDep>
    ) {
        this._driver = driver
        this._middlewares = middlewares
        this._overrides = overrides
        this.createCursor = createCursor
        this.notify = notify
        this._parents = []
        this._cache = cache || Object.create(null)
        this._plugins = plugins
        this._lastId = 0
    }

    newRoot(): AnnotationResolver {
        return new AnnotationResolverImpl(
            this._driver,
            this._middlewares,
            this._overrides,
            this.createCursor,
            this.notify,
            this._plugins,
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

    _createId(): string {
        return '' + (++this._lastId)
    }

    resolveAnnotation(annotation: AnyAnnotation): AnyDep {
        function dummyDependency(): void {}
        return this.resolve(this._driver.set(dummyDependency, annotation))
    }

    resolve(annotatedDep: Dependency): AnyDep {
        const {_parents: parents} = this
        let annotation: AnyAnnotation = this._driver.get(annotatedDep);
        let dep: AnyDep = this._cache[annotation.base.id];
        if (!dep) {
            const {base} = annotation
            let id = base.id
            if (!id) {
                id = base.id = this._createId()
            }
            const overridedDep: ?Dependency = this._overrides.get(annotatedDep);
            if (overridedDep) {
                annotation = this._driver.get(overridedDep)
                annotation.base.id = id
            }
            const plugin: Plugin = this._plugins[annotation.kind];
            plugin.create(annotation, (this: AnnotationResolver))
            dep = this._cache[id]
            dep.base.resolve = createResolver(plugin.resolve, dep, (this: AnnotationResolver))
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

    _resolveMiddlewares(dep: Dependency, tags: Array<Tag>): ?Array<AnyDep> {
        const {_middlewares: middlewares} = this
        const ids: Array<Dependency|Tag> = [dep].concat(tags);
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

    getDeps(deps: ?Deps, dep: Dependency, tags: Array<Tag>): DepArgs {
        let depNames: ?Array<string> = null;
        const resolvedDeps: Array<AnyDep> = [];
        if (deps && deps.length) {
            if (typeof deps[0] === 'object' && deps.length === 1) {
                depNames = []
                const argsObject: SimpleMap<string, Dependency> = ((deps[0]: any): SimpleMap<string, Dependency>);
                for (let key in argsObject) {
                    resolvedDeps.push(this.resolve(argsObject[key]))
                    depNames.push(key)
                }
            } else {
                for (let i = 0, l = deps.length; i < l; i++) {
                    resolvedDeps.push(this.resolve(((deps: any): Array<Dependency>)[i]))
                }
            }
        }
        const middlewares: ?Array<AnyDep> = this._resolveMiddlewares(dep, tags);

        return new DepArgsImpl(resolvedDeps, depNames, middlewares)
    }
}
