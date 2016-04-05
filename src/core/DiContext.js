/* @flow */
import type {
    Tag,
    SimpleMap,
    Dependency,
    Annotation
} from 'reactive-di/i/annotationInterfaces'

import type {
    Resolver,
    Context,
    Plugin,
    ResolverCreator,
    ResolveDepsResult,
    CreateResolverOptions
} from 'reactive-di/i/nodeInterfaces'

import ResolveHelper from 'reactive-di/core/ResolveHelper'
import getFunctionName from 'reactive-di/utils/getFunctionName'
import normalizeConfiguration from 'reactive-di/core/normalizeConfiguration'
import annotationSingleton from 'reactive-di/core/annotationSingleton'

export default class DiContext {
    _helper: ResolveHelper;

    _resolverCache: Map<Dependency, Resolver>;
    _cache: Map<Dependency, ResolverCreator>;
    _plugins: SimpleMap<string, Plugin>;
    _annotations: Map<Dependency, Annotation>;
    _parent: ?DiContext;

    parents: Array<ResolverCreator>;

    constructor(
        plugins: SimpleMap<string, Plugin>,
        parent?: DiContext,
        config?: Array<Annotation>,
        resolverCache?: Map<Dependency, Resolver>
    ) {
        this._resolverCache = resolverCache || new Map()
        this._cache = new Map()
        this.parents = []
        this._plugins = plugins;

        this._parent = parent
        const rec = normalizeConfiguration(config || annotationSingleton)
        this._annotations = rec.annotations

        this._helper = new ResolveHelper(
            rec.middlewares,
            this
        )
    }

    create(config: Array<Annotation>): Context {
        return new DiContext(
            this._plugins,
            this,
            config
        )
    }

    replace(annotatedDep: Dependency, annotation?: Annotation): void {
        if (this._parent) {
            this._parent.replace(annotatedDep, annotation)
        }
        if (!this._annotations.has(annotatedDep)) {
            return
        }
        const {_cache: cache} = this
        const dep = cache.get(annotatedDep)
        if (dep) {
            cache.clear(annotatedDep)
            dep.childs.forEach((childDep) => {
                cache.clear(childDep.target)
            })
        }

        if (annotation) {
            this._annotations.set(annotatedDep, annotation)
        }
    }

    addRelation(dep: ResolverCreator): void {
        const parents = this.parents
        for (let i = 0, l = parents.length; i < l; i++) {
            parents[i].childs.add(dep)
        }
    }

    _invokePlugin(annotation: Annotation): ResolverCreator {
        let dep: ?ResolverCreator;
        const plugin: ?Plugin = this._plugins[annotation.kind];
        if (!plugin) {
            throw new Error(
                `Plugin not found for annotation ${getFunctionName(annotation.target)}`
            )
        }
        const parents = this.parents
        dep = plugin.create(annotation, this)
        this._cache.set(annotation.target, dep)
        parents.push(dep)
        plugin.finalize(dep, annotation, this)
        parents.pop()

        return dep
    }

    getResolverCreator(annotatedDep: Dependency): ResolverCreator {
        let dep: ?ResolverCreator;
        let annotation: ?Annotation;
        dep = this._cache.get(annotatedDep)
        if (dep) {
            return dep
        }

        annotation = this._annotations.get(annotatedDep);

        if (annotation) {
            return this._invokePlugin(annotation)
        }

        if (this._parent) {
            return this._parent.getResolverCreator(annotatedDep)
        }

        throw new Error(`Can't find annotation for ${getFunctionName(annotatedDep)}`)
    }

    getResolver(annotatedDep: Dependency): Resolver {
        let resolver: ?Resolver;
        resolver = this._resolverCache.get(annotatedDep);
        if (!resolver) {
            resolver = this.getResolverCreator(annotatedDep).createResolver()
            this._resolverCache.set(annotatedDep, resolver)
        }

        return resolver
    }

    createDepResolver(rec: CreateResolverOptions, tags: Array<Tag>): () => ResolveDepsResult {
        const {deps, depNames} = this._helper.getDeps(rec.deps);
        const middlewares = this._helper.getMiddlewares(
            rec.target,
            tags
        );

        return function resolveDeps(): ResolveDepsResult {
            const argsArray = []
            const argsObject = {}
            for (let i = 0, j = deps.length; i < j; i++) {
                const dep = deps[i];
                if (depNames) {
                    argsObject[depNames[i]] = dep.resolve()
                } else {
                    argsArray.push(dep.resolve())
                }
            }

            let resolvedMiddlewares: ?Array<any> = null;
            if (middlewares) {
                resolvedMiddlewares = []
                for (let i = 0, j = middlewares.length; i < j; i++) {
                    const mdl = middlewares[i];
                    resolvedMiddlewares.push(mdl.resolve())
                }
            }

            return {
                deps: depNames ? [argsObject] : argsArray,
                middlewares: resolvedMiddlewares
            }
        }
    }
}
