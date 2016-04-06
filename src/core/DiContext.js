/* @flow */
import type {
    Tag,
    Dependency,
    Annotation
} from 'reactive-di/i/annotationInterfaces'

import type {
    Resolver,
    Context,
    Provider,
    Plugin,
    ResolveDepsResult,
    CreateResolverOptions
} from 'reactive-di/i/nodeInterfaces'

import ResolveHelper from 'reactive-di/core/ResolveHelper'
import getFunctionName from 'reactive-di/utils/getFunctionName'
import normalizeConfiguration from 'reactive-di/core/normalizeConfiguration'
import driver from 'reactive-di/core/annotationDriver'

type ParentRec = [Provider, Map<Provider, boolean>];

export default class DiContext {
    _helper: ResolveHelper;

    _resolverCache: Map<Dependency, Resolver>;
    _cache: Map<Dependency, Provider>;
    _plugins: Map<string, Plugin>;
    _annotations: Map<Dependency, Annotation>;
    _parent: ?DiContext;

    _parents: Array<ParentRec>;

    constructor(
        plugins: Map<string, Plugin>,
        parent?: DiContext,
        config?: Array<Annotation>,
        resolverCache?: Map<Dependency, Resolver>
    ) {
        this._resolverCache = resolverCache || new Map()
        this._cache = new Map()
        this._parents = []
        this._plugins = plugins;

        this._parent = parent
        const rec = normalizeConfiguration(config || [])
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
            dep.getChilds().forEach((childDep) => {
                cache.clear(childDep.annotation.target)
            })
        }

        if (annotation) {
            this._annotations.set(annotatedDep, annotation)
        }
    }

    _createProvider(annotation: Annotation): Provider {
        const plugin: ?Plugin = this._plugins.get(annotation.kind);
        if (!plugin) {
            throw new Error(
                `Provider not found for annotation ${getFunctionName(annotation.target)}`
            )
        }
        const parents = this._parents
        const provider: Provider = plugin.create(annotation, this);
        this._cache.set(annotation.target, provider)

        for (let i = 0, l = parents.length; i < l; i++) {
            const parent: ParentRec = parents[i];
            if (provider.canAddToParent(parent[0])) {
                parent[1].set(provider, true)
            }
        }

        const rec: ParentRec = [
            provider,
            new Map()
        ];

        parents.push(rec)
        provider.init(this)
        parents.pop()

        function iterateSet(val: boolean, childDep: Provider): void {
            provider.addChild(childDep)
        }

        rec[1].forEach(iterateSet)

        return provider
    }

    getProvider(annotatedDep: Dependency): Provider {
        let dep: ?Provider;
        let annotation: ?Annotation;
        dep = this._cache.get(annotatedDep)
        if (dep) {
            return dep
        }

        annotation = this._annotations.get(annotatedDep);
        if (annotation) {
            return this._createProvider(annotation)
        }

        if (this._parent) {
            return this._parent.getProvider(annotatedDep)
        }
        annotation = driver.get(annotatedDep)
        if (annotation) {
            return this._createProvider(annotation)
        }

        throw new Error(`Can't find annotation for ${getFunctionName(annotatedDep)}`)
    }

    getResolver(annotatedDep: Dependency): Resolver {
        let resolver: ?Resolver;
        resolver = this._resolverCache.get(annotatedDep);
        if (!resolver) {
            resolver = this.getProvider(annotatedDep).createResolver()
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
