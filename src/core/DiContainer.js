/* @flow */
import type {
    Tag,
    DependencyKey
} from 'reactive-di/i/coreInterfaces'

import type {
    Container,
    Provider,
    Resolver,
    ResolveDepsResult,
    CreateResolverOptions
} from 'reactive-di/i/coreInterfaces'

import ResolveHelper from 'reactive-di/core/ResolveHelper'
import createDepResolverCreator from 'reactive-di/core/createDepResolverCreator'
import getFunctionName from 'reactive-di/utils/getFunctionName'
import SimpleMap from 'reactive-di/utils/SimpleMap'

export type ProviderManager = {
    middlewares: Map<DependencyKey|Tag, Array<DependencyKey>>;
    addCacheHandler(cache: Map<DependencyKey, Resolver>): void;
    removeCacheHandler(cache: Map<DependencyKey, Resolver>): void;
    getProvider(annotatedDep: DependencyKey, Container: Container): ?Provider;
}

export default class DiContainer {
    _cache: Map<DependencyKey, Resolver>;
    _parent: ?Container;
    _providerManager: ProviderManager;
    _removeCacheHandler: () => void;

    createDepResolver: (rec: CreateResolverOptions, tags: Array<Tag>) => () => ResolveDepsResult;

    constructor(
        providerManager: ProviderManager,
        parent: ?Container = null
    ) {
        this._cache = new SimpleMap()
        this._providerManager = providerManager
        this._parent = parent || null

        const helper = new ResolveHelper(
            providerManager.middlewares,
            this
        )

        this.createDepResolver = createDepResolverCreator(helper)

        providerManager.addCacheHandler(this._cache)
    }

    finalize(): void {
        this._providerManager.removeCacheHandler(this._cache)
    }

    get(annotatedDep: DependencyKey): any {
        return this.getResolver(annotatedDep).resolve()
    }

    getResolver(annotatedDep: DependencyKey): Resolver {
        let resolver: ?Resolver = this._cache.get(annotatedDep);
        if (!resolver) {
            const provider: ?Provider = this._providerManager.getProvider(
                annotatedDep,
                (this: Container)
            );
            if (!provider) {
                if (!this._parent) {
                    throw new Error(`Can't find annotation for ${getFunctionName(annotatedDep)}`)
                }
                resolver = this._parent.getResolver(annotatedDep)
            } else {
                resolver = provider.createResolver()
            }
            this._cache.set(annotatedDep, resolver)
        }

        return resolver
    }
}
