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
    CreateResolverOptions,
    ProviderInitializer
} from 'reactive-di/i/nodeInterfaces'

import ResolveHelper from 'reactive-di/core/ResolveHelper'
import getFunctionName from 'reactive-di/utils/getFunctionName'
import normalizeConfiguration from 'reactive-di/core/normalizeConfiguration'
import driver from 'reactive-di/core/annotationDriver'

export default class DiContext {
    _helper: ResolveHelper;

    _resolverCache: Map<Dependency, Resolver>;
    _providerCache: Map<Dependency, Provider>;
    _plugins: Map<string, Plugin>;
    _annotations: Map<Dependency, Annotation>;
    _parent: ?DiContext;

    _initializer: ProviderInitializer;

    constructor(
        plugins: Map<string, Plugin>,
        initializer: ProviderInitializer,
        parent?: DiContext,
        config?: Array<Annotation>,
        resolverCache?: Map<Dependency, Resolver>
    ) {
        this._resolverCache = resolverCache || new Map()
        this._providerCache = new Map()
        this._plugins = plugins;
        this._initializer = initializer
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
            this._initializer,
            this,
            config
        )
    }

    resetCache(annotatedDep: Dependency): void {
        const {_providerCache: providerCache, _resolverCache: resolverCache} = this
        const provider: ?Provider = providerCache.get(annotatedDep);
        if (provider) {
            const parents = provider.getParents()
            for (let i = 0, l = parents.length; i < l; i++) {
                const target = parents[i].annotation.target
                providerCache.clear(target)
                resolverCache.clear(target)
            }
        }
    }

    replace(annotatedDep: Dependency, annotation?: Annotation): void {
        if (this._parent) {
            this._parent.replace(annotatedDep, annotation)
        }
        if (!this._annotations.has(annotatedDep)) {
            return
        }
        this.resetCache(annotatedDep)
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

        const provider: Provider = plugin.create(annotation, this);
        this._providerCache.set(annotation.target, provider)

        this._initializer.begin(provider)
        provider.init(this)
        this._initializer.end(provider)

        return provider
    }

    getProvider(annotatedDep: Dependency): Provider {
        let annotation: ?Annotation;
        let provider: ?Provider = this._providerCache.get(annotatedDep);
        if (provider) {
            this._initializer.inheritRelations(provider)
            return provider
        }

        annotation = this._annotations.get(annotatedDep);
        if (annotation) {
            provider = this._createProvider(annotation)
            return provider
        }

        if (this._parent) {
            provider = this._parent.getProvider(annotatedDep)
            this._providerCache.get(annotatedDep, provider)
            return provider
        }

        annotation = driver.get(annotatedDep)
        if (annotation) {
            provider = this._createProvider(annotation)
            return provider
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
