/* @flow */

import createId from '../utils/createId'
import type {
    DepId,
    Dependency,
    AnnotationDriver,
    AnyAnnotation
} from '../annotations/annotationInterfaces'
import type {AnyDep} from '../nodes/nodeInterfaces'
import type {ResolverMap} from './resolverInterfaces'

type Middlewares = {[id: DepId]: Array<Dependency>};

export default class AnnotationResolver {
    _cache: {[id: DepId]: any};
    _driver: AnnotationDriver;
    _middlewares: Middlewares;
    _resolvers: ResolverMap;
    // array of parents set of all dependencies
    _parents: Array<Set<DepId>>;

    constructor(driver: AnnotationDriver, resolvers: ResolverMap, middlewares: Middlewares) {
        this._driver = driver
        this._middlewares = middlewares
        this._cache = Object.create(null)
        this._parents = []
        this._resolvers = resolvers
    }

    _isAffected(id: DepId): boolean {
        const dep: AnyDep = this._cache[id];
        if (dep) {
            const relations: Array<AnyDep> = dep.relations;
            const parents: Array<Set<DepId>> = this._parents;
            for (let i = 0, l = relations.length; i < l; i++) {
                const relationId = relations[i].id
                for (let j = 0, k = parents.length; j < k; j++) {
                    parents[j].add(relationId)
                }
            }
            return true
        }
        return false
    }

    begin<T: AnyDep>(dep: T): void {
        this._parents.push(new Set())
        this._cache[dep.id] = dep
    }

    end<T: AnyDep>(dep: T): void {
        const cache = this._cache
        const depSet: Set<DepId> = this._parents.pop();
        function iteratePathSet(relationId: DepId): void {
            cache[relationId].relations.push(dep)
        }
        depSet.forEach(iteratePathSet)
    }

    resolve<T: AnyDep, D: Function>(annotatedDep: D): T {
        const {_cache: cache} = this
        const annotation: AnyAnnotation = this._driver.get(annotatedDep);
        let dep: T = cache[annotation.id];
        if (!dep) {
            let id = annotation.id
            if (!id) {
                id = createId()
                annotation.id = id
            }

            if (this._isAffected(id)) {
                return cache[id]
            }
            this._resolvers[annotation.kind](annotation, this)
            dep = cache[id]
        }
        return dep
    }
}
