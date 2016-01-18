/* @flow */
import createId from '../utils/createId'

import type {
    AnyDep,
    ModelDep,
    SetterDep,
    FactoryDep,
    ClassDep,
    MetaDep
} from '../nodes/nodeInterfaces'

import type {
    DepId,
    Deps,
    Dependency,
    AnnotationDriver,
    ModelAnnotation,
    SetterAnnotation,
    FactoryAnnotation,
    ClassAnnotation,
    MetaAnnotation,
    AnyAnnotation
} from '../annotations/annotationInterfaces'

type Middlewares = {[id: DepId]: Array<Dependency>};

const DefaultHooks = {
    onUpdate() {},
    onMount() {},
    onUnmount() {}
}

export default class AnnotationResolver {
    _cache: {[id: DepId]: AnyDep};
    _driver: AnnotationDriver;
    _middlewares: Middlewares;
    _updater: CacheUpdater;

    constructor(driver: AnnotationDriver, middlewares: Middlewares) {
        this._driver = driver
        this._middlewares = middlewares
        this._cache = Object.create(null)
        this._updater = new CacheUpdater(cache)
    }

    resolve(annotatedDep: Dependency): AnyDep {
        const {_cache: cache} = this
        const annotation: AnyAnnotation = this._driver.get(annotatedDep);
        let dep = cache[annotation.id]
        if (!dep) {
            this._resolve(annotatedDep)
            dep = cache[annotation.id]
        }
        return dep
    }

    _resolve<T>(annotatedDep: Dependency): T {
        const {_cache: cache, _updater: acc} = this
        const annotation: AnyAnnotation = this._driver.get(annotatedDep);
        let id = annotation.id
        if (!id) {
            id = createId()
            annotation.id = id
        }

        if (acc.isAffected(id)) {
            return cache[id]
        }
        acc.begin(id)
        let dep: AnyDep;
        switch (annotation.kind) {
        case 1: // model
            dep = this.resolveModel(annotation)
            break
        case 2: // Class
            dep = this.resolveClass(annotation)
            break
        case 3: // factory
            dep = this.resolveFactory(annotation)
            break
        case 4: // meta
            dep = this.resolveMeta(annotation)
            break
        case 5: // setter
            dep = this.resolveSetter(annotation)
            break
        default:
            throw new Error('Unkown kind ' + (annotation.kind || 'unknown'))
        }
        acc.end(dep)

        return ((dep: any): T)
    }

    resolveModel(annotation: ModelAnnotation): ModelDep {
        throw new Error('Dep nodes for data must be resolved in state converter')
    }

    _resolveMiddlewares(mdls: ?Array<Dependency>): ?Array<AnyDep> {
        let result: ?Array<AnyDep> = null;
        if (mdls && mdls.length) {
            result = [];
            for (let i = 0, l = mdls.length; i < l; i++) {
                result.push(this._resolve(mdls[i]))
            }
        }

        return result
    }

    _getDeps(depsAnnotations: Deps): {
        deps: Array<AnyDep>,
        depNames: ?Array<string>
    } {
        let depNames: ?Array<string> = null;
        const deps: Array<AnyDep> = [];
        if (Array.isArray(depsAnnotations)) {
            for (let i = 0, l = depsAnnotations.length; i < l; i++) {
                deps.push(this._resolve(depsAnnotations[i]))
            }
        } else {
            depNames = Object.keys(depsAnnotations)
            for (let i = 0, l = depNames.length; i < l; i++) {
                deps.push(this._resolve(depsAnnotations[depNames[i]]))
            }
        }

        return {
            deps,
            depNames
        }
    }

    resolveClass(annotation: ClassAnnotation): ClassDep {
        const middlewares = this._resolveMiddlewares(this._middlewares[annotation.id])
        const {deps, depNames} = this._getDeps(annotation.deps || [])
        return {
            kind: 2,
            info: annotation.info,
            cache: {
                isRecalculate: true,
                value: null
            },
            hooks: annotation.hooks || DefaultHooks,
            middlewares,
            deps,
            depNames,
            proto: annotation.proto
        }
    }

    resolveFactory(annotation: FactoryAnnotation): FactoryDep {
        const middlewares = this._resolveMiddlewares(this._middlewares[annotation.id])
        const {deps, depNames} = this._getDeps(annotation.deps || [])
        return {
            kind: 3,
            info: annotation.info,
            cache: {
                isRecalculate: true,
                value: null
            },
            hooks: annotation.hooks || DefaultHooks,
            middlewares,
            deps,
            depNames,
            fn: annotation.fn
        }
    }

    resolveMeta(annotation: MetaAnnotation): MetaDep {
        const sourceDep: ModelDep = this._resolve(annotation.source);
        const sources: Array<ModelDep> = sourceDep.childs.concat(sourceDep);
        return {
            kind: 4,
            info: annotation.info,
            cache: {
                isRecalculate: true,
                value: null
            },
            sources
        }
    }

    resolveSetter(annotation: SetterAnnotation): SetterDep {
        const {id, info, hooks, deps, fn, model} = annotation
        const facet: FactoryDep = this._resolve({kind: 4, id, info, hooks, deps, fn});
        const target: ModelDep = this._resolve(model);
        return {
            kind: 5,
            info,
            cache: {
                isRecalculate: true,
                value: null
            },
            facet,
            cursor: target.cursor
        }
    }
}
