/* flow */

import createId from '../utils/createId'
import type {
    DepId,
    Tag,
    Dependency,
    AnnotationDriver,
    AnyAnnotation
} from '../annotations/annotationInterfaces'
import type {
    AnyDep,
    FactoryDep,
    ClassDep,
    Notifier
} from '../nodes/nodeInterfaces'
import type {
    ResolverTypeMap,
    DependencyResolver,
    AnnotationResolver
} from './resolverInterfaces'
import type {
    SimpleMap,
    Cursor,
    CursorCreator
} from '../modelInterfaces'

// implements DependencyResolver, AnnotationResolver
export default class AnnotationResolverImpl {
    _cache: SimpleMap<DepId, AnyDep>;
    _driver: AnnotationDriver;
    _resolvers: ResolverTypeMap;
    // array of parents set of all dependencies
    _parents: Array<Set<DepId>>;

    _middlewares: SimpleMap<DepId|Tag, Array<Dependency>>;
    cursorCreator: CursorCreator;
    notifier: Notifier;

    constructor(
        driver: AnnotationDriver,
        resolvers: ResolverTypeMap,
        middlewares: SimpleMap<DepId|Tag, Array<Dependency>>,
        cursorCreator: CursorCreator,
        notifier: Notifier
    ) {
        this._driver = driver
        this._middlewares = middlewares
        this._cache = Object.create(null)
        this._parents = []
        this._resolvers = resolvers

        this.cursorCreator = cursorCreator
        this.notifier = notifier
    }

    resolveMiddlewares(id: DepId, tags: Array<Tag>): ?Array<FactoryDep|ClassDep> {
        const middlewares: SimpleMap<DepId|Tag, Array<Dependency>> = this._middlewares;
        const result: Array<FactoryDep|ClassDep> = [];
        const ids: Array<DepId|Tag> = [id].concat(tags);
        for (let i = 0, l = ids.length; i < l; i++) {
            const middlewaresByIdOrTag: Array<Dependency> = middlewares[ids[i]]
            if (middlewaresByIdOrTag) {
                for (let j = 0, k = middlewaresByIdOrTag.length; j < k; j++) {
                    result.push(this.resolve(middlewaresByIdOrTag[j]))
                }
            }
        }

        return result.length ? result : null
    }

    begin(dep: AnyDep): void {
        this._parents.push(new Set())
        this._cache[dep.id] = dep
    }

    end(dep: AnyDep): void {
        const cache = this._cache
        const depSet: Set<DepId> = this._parents.pop();
        function iteratePathSet(relationId: DepId): void {
            cache[relationId].base.relations.push(dep)
        }
        depSet.forEach(iteratePathSet)
    }

    _inheritRelations(dep: AnyDep): void {
        const relations: Array<AnyDep> = dep.base.relations;
        const parents: Array<Set<DepId>> = this._parents;
        for (let i = 0, l = relations.length; i < l; i++) {
        const relationId: DepId = relations[i].id;
            for (let j = 0, k = parents.length; j < k; j++) {
                parents[j].add(relationId)
            }
        }
    }

    _resolve<V: any, E>(annotation: AnyAnnotation): AnyDep<V, E> {
        let id = annotation.id
        if (!id) {
            id = createId()
            annotation.id = id
        }
        this._resolvers[annotation.kind](annotation, (this: AnnotationResolver))
        return this._cache[id]
    }

    resolve<V: any, E>(annotatedDep: Dependency<V>): AnyDep<V, E> {
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

    get<V: any, E>(annotatedDep: Dependency<V>): AnyDep<V, E> {
        const {_cache: cache} = this
        const annotation: AnyAnnotation = this._driver.get(annotatedDep);
        let dep: AnyDep<V, E> = cache[annotation.id];
        if (!dep) {
            dep = this._resolve(annotation)
        }
        return dep
    }
}
