/* @flow */

import createId from '../utils/createId'
import type {
    DepId,
    Dependency,
    AnnotationDriver,
    AnyAnnotation
} from '../annotations/annotationInterfaces'
import type {
    AnyDep
} from '../nodes/nodeInterfaces'
import type {
    ResolverTypeMap,
    DependencyResolver,
    AnnotationResolver,
    Middlewares
} from './resolverInterfaces'

// implements DependencyResolver, AnnotationResolver
export default class AnnotationResolverImpl {
    _cache: {[id: DepId]: any};
    _driver: AnnotationDriver;
    _resolvers: ResolverTypeMap;
    // array of parents set of all dependencies
    _parents: Array<Set<DepId>>;

    middlewares: Middlewares;

    constructor(driver: AnnotationDriver, resolvers: ResolverTypeMap, middlewares: Middlewares) {
        this._driver = driver
        this.middlewares = middlewares
        this._cache = Object.create(null)
        this._parents = []
        this._resolvers = resolvers
    }

    begin<V, E>(dep: AnyDep<V, E>): void {
        this._parents.push(new Set())
        this._cache[dep.id] = dep
    }

    end<V, E>(dep: AnyDep<V, E>): void {
        const cache = this._cache
        const depSet: Set<DepId> = this._parents.pop();
        function iteratePathSet(relationId: DepId): void {
            cache[relationId].relations.push(dep)
        }
        depSet.forEach(iteratePathSet)
    }

    _inheritRelations<V, E>(dep: AnyDep<V, E>): void {
        const relations: Array<AnyDep> = dep.base.relations;
        const parents: Array<Set<DepId>> = this._parents;
        for (let i = 0, l = relations.length; i < l; i++) {
        const relationId: DepId = relations[i].id;
            for (let j = 0, k = parents.length; j < k; j++) {
                parents[j].add(relationId)
            }
        }
    }

    _resolve<V, E>(annotation: AnyAnnotation): AnyDep<V, E> {
        let id = annotation.id
        if (!id) {
            id = createId()
            annotation.id = id
        }
        this._resolvers[annotation.kind](annotation, (this: AnnotationResolver))
        return this._cache[id]
    }

    resolve<V, E>(annotatedDep: Dependency<V>): AnyDep<V, E> {
        const {_cache: cache} = this
        const annotation: AnyAnnotation = this._driver.get(annotatedDep);
        let dep: AnyDep<V, E> = cache[annotation.id];
        if (dep) {
            this._inheritRelations(dep)
        } else {
            dep = this._resolve(annotation)
        }
        return dep
    }

    get<V, E>(annotatedDep: Dependency<V>): AnyDep<V, E> {
        const {_cache: cache} = this
        const annotation: AnyAnnotation = this._driver.get(annotatedDep);
        let dep: AnyDep<V, E> = cache[annotation.id];
        if (!dep) {
            dep = this._resolve(annotation)
        }
        return dep
    }
}
