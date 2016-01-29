/* @flow */

import createId from '../utils/createId'
import type {
    AnnotationDriver,
    DepId,
    Dependency,
    Deps,
    AnyAnnotation,
    Tag
} from '../annotationInterfaces'
import type {
    Notifier,
    SimpleMap,
    CursorCreator
} from '../modelInterfaces'
import type {
    AnyDep,
    DepArgs,
    DependencyResolver,
    AnnotationResolver
} from '../nodeInterfaces'
import type {FinalizeFn} from '../pluginInterfaces'
import type {Plugin} from '../pluginInterfaces'
import {DepArgsImpl} from './DepArgsImpl'

// implements DependencyResolver, AnnotationResolver
export default class AnnotationResolverImpl {
    _driver: AnnotationDriver;
    _middlewares: SimpleMap<DepId|string, Array<Dependency>>;
    _parents: Array<Set<DepId>>;
    _cache: SimpleMap<DepId, AnyDep>;
    _plugins: SimpleMap<string, Plugin>;

    createCursor: CursorCreator;
    notifier: Notifier;

    constructor(
        driver: AnnotationDriver,
        middlewares: SimpleMap<DepId|Tag, Array<Dependency>>,
        createCursor: CursorCreator,
        notifier: Notifier,
        plugins: SimpleMap<string, Plugin>,
        cache?: SimpleMap<DepId, AnyDep>
    ) {
        this._driver = driver
        this._middlewares = middlewares
        this.createCursor = createCursor
        this.notifier = notifier
        this._parents = []
        this._cache = cache || Object.create(null)
        this._plugins = plugins
    }

    newRoot(): AnnotationResolver {
        return new AnnotationResolverImpl(
            this._driver,
            this._middlewares,
            this.createCursor,
            this.notifier,
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
        const iterateFn: FinalizeFn<T> = this._plugins[dep.kind];

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

    get(annotatedDep: Dependency): AnyDep {
        const dep: AnyDep = this.resolve(annotatedDep, true);
        return dep.base.resolve(dep, (this: DependencyResolver))
    }

    resolve(annotatedDep: Dependency, isRoot: boolean = false): AnyDep {
        const annotation: AnyAnnotation = this._driver.get(annotatedDep);
        let dep: AnyDep = this._cache[annotation.base.id];
        if (!dep) {
            const {_plugins: plugins} = this
            const {base} = annotation
            if (!base.id) {
                base.id = createId()
            }
            const plugin: Plugin = plugins[annotation.kind];
            plugin.create(annotation, (this: AnnotationResolver))
            dep = this._cache[base.id]
            dep.base.resolve = plugin.resolve
        } else if (!isRoot) {
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

    _resolveMiddlewares(id: DepId, tags: Array<Tag>): ?Array<AnyDep> {
        const {_middlewares: middlewares} = this
        const ids: Array<Tag> = [id].concat(tags);
        const middlewareDeps: Array<AnyDep> = [];
        for (let i = 0, l = ids.length; i < l; i++) {
            const depMiddlewares: Array<Dependency> = middlewares[ids[i]] || [];
            for (let j = 0, k = depMiddlewares.length; j < k; j++) {
                middlewareDeps.push(this.resolve(depMiddlewares[j]))
            }
        }

        return middlewareDeps.length ? middlewareDeps : null
    }

    getDeps(deps: ?Deps, id: DepId, tags: Array<Tag>): DepArgs {
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
        const middlewares: ?Array<AnyDep> = this._resolveMiddlewares(id, tags);

        return new DepArgsImpl(resolvedDeps, depNames, middlewares)
    }
}
