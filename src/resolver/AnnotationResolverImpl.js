/* @flow */

import type {
    Deps,
    DepId,
    Tag,
    Dependency,
    AnnotationDriver,
    AnyAnnotation
} from '../annotations/annotationInterfaces'
import type {
    Cacheable,
    DepBase,
    DepArgs,
    AnyDep,
    FactoryDep,
    ClassDep,
    MetaDep,
    AsyncUpdater
} from '../nodes/nodeInterfaces'
import type {
    ResolverType,
    ResolverTypeMap,
    DependencyResolver,
    AnnotationResolver
} from './resolverInterfaces'
import type {
    Notifier,
    SimpleMap,
    Cursor,
    CursorCreator
} from '../modelInterfaces'
import type {FinalizeFn} from './finalizers'

import {DepArgsImpl} from '../nodes/nodeImpl'
import createId from '../utils/createId'
import {defaultFinalizer, metaFinalizer} from './finalizers'

const defaultFinalizers = {
    meta: metaFinalizer
}

// implements DependencyResolver, AnnotationResolver
export default class AnnotationResolverImpl {
    _driver: AnnotationDriver;
    _resolvers: SimpleMap<string, ResolverType>;
    _middlewares: SimpleMap<DepId|string, Array<Dependency>>;
    _parents: Array<Set<DepId>>;
    _cache: SimpleMap<DepId, AnyDep>;
    _finalizers: SimpleMap<string, FinalizeFn>;

    createCursor: CursorCreator;
    notifier: Notifier;

    constructor(
        driver: AnnotationDriver,
        resolvers: SimpleMap<string, ResolverType>,
        middlewares: SimpleMap<DepId|string, Array<Dependency>>,
        createCursor: CursorCreator,
        notifier: Notifier,
        cache: SimpleMap<DepId, AnyDep>
    ) {
        this._driver = driver
        this._resolvers = resolvers
        this._middlewares = middlewares
        this.createCursor = createCursor
        this.notifier = notifier
        this._parents = []
        this._cache = cache
        this._finalizers = defaultFinalizers
    }

    newRoot(): AnnotationResolver {
        return new AnnotationResolverImpl(
            this._driver,
            this._resolvers,
            this._middlewares,
            this.createCursor,
            this.notifier,
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
        const iterateFn: FinalizeFn<T> = this._finalizers[dep.kind] || defaultFinalizer;

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

    resolveRoot(annotatedDep: Dependency): AnyDep {
        return this.resolve(annotatedDep, true)
    }

    resolve(annotatedDep: Dependency, isRoot: boolean = false): AnyDep {
        const annotation: AnyAnnotation = this._driver.get(annotatedDep);
        let dep: AnyDep = this._cache[annotation.base.id];
        if (!dep) {
            const {_resolvers: resolvers} = this
            const {base} = annotation
            if (!base.id) {
                base.id = createId()
            }
            const resolver: ResolverType = resolvers[annotation.kind];
            resolver(annotation, this)
            dep = this._cache[base.id]
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

    _resolveMiddlewares(id: DepId, tags: Array<string>): ?Array<AnyDep> {
        const {_middlewares: middlewares} = this
        const ids: Array<string> = [id].concat(tags);
        const middlewareDeps: Array<AnyDep> = [];
        for (let i = 0, l = ids.length; i < l; i++) {
            const depMiddlewares: Array<Dependency> = middlewares[ids[i]] || [];
            for (let j = 0, k = depMiddlewares.length; j < k; j++) {
                middlewareDeps.push(this.resolve(depMiddlewares[j]))
            }
        }

        return middlewareDeps.length ? middlewareDeps : null
    }

    getDeps(deps: ?Deps, id: DepId, tags: Array<string>): DepArgs {
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
