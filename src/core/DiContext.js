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
    ResolverCacheRec,
    Plugin,
    ResolveDepsResult,
    CreateResolverOptions,
    RelationUpdater
} from 'reactive-di/i/nodeInterfaces'

import ResolveHelper from 'reactive-di/core/ResolveHelper'
import createDepResolverCreator from 'reactive-di/core/createDepResolverCreator'
import getFunctionName from 'reactive-di/utils/getFunctionName'
import normalizeConfiguration from 'reactive-di/core/normalizeConfiguration'
import driver from 'reactive-di/core/annotationDriver'

export default class DiContext {
    _resolverCache: Map<Dependency, ResolverCacheRec>;
    _plugins: Map<string, Plugin>;
    _annotations: Map<Dependency, Annotation>;
    _parent: ?DiContext;

    _initializer: RelationUpdater;

    createDepResolver: (rec: CreateResolverOptions, tags: Array<Tag>) => () => ResolveDepsResult;

    constructor(
        plugins: Map<string, Plugin>,
        initializer: RelationUpdater,
        parent?: DiContext,
        config?: Array<Annotation>,
        resolverCache?: Map<Dependency, ResolverCacheRec>
    ) {
        this._resolverCache = resolverCache || new Map()
        this._plugins = plugins;
        this._initializer = initializer
        this._parent = parent
        const rec = normalizeConfiguration(config || [])
        this._annotations = rec.annotations

        const helper = new ResolveHelper(
            rec.middlewares,
            this
        )

        this.createDepResolver = createDepResolverCreator(helper)
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
        const rc = this._resolverCache
        const cr: ?ResolverCacheRec = rc.get(annotatedDep);
        if (cr) {
            const parents = cr.provider.getParents()
            for (let i = 0, l = parents.length; i < l; i++) {
                rc.clear(parents[i].annotation.target)
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

        const provider: Provider = plugin.create(annotation);
        this._initializer.begin(provider)
        provider.init(this)
        this._initializer.end(provider)

        return provider
    }

    _createCacheRec(annotatedDep: Dependency): ?Provider {
        let provider: ?Provider;
        let annotation: ?Annotation = this._annotations.get(annotatedDep);
        if (annotation) {
            provider = this._createProvider(annotation)
        }

        if (!provider && !this._parent) {
            annotation = driver.get(annotatedDep)
            if (annotation) {
                provider = this._createProvider(annotation)
            }
        }

        return provider
    }

    getCached(annotatedDep: Dependency): ResolverCacheRec {
        let cr: ?ResolverCacheRec = this._resolverCache.get(annotatedDep);
        if (!cr) {
            const provider: ?Provider = this._createCacheRec(annotatedDep);
            if (!provider) {
                if (!this._parent) {
                    throw new Error(`Can't find annotation for ${getFunctionName(annotatedDep)}`)
                }
                cr = this._parent.getCached(annotatedDep)
            } else {
                cr = {
                    provider,
                    resolver: provider.createResolver()
                }
            }
            this._resolverCache.set(annotatedDep, cr)
        }

        return cr
    }

    getResolver(annotatedDep: Dependency): Resolver {
        return this.getCached(annotatedDep).resolver
    }
}
