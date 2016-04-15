/* @flow */
import type {
    Tag,
    DependencyKey
} from 'reactive-di/i/coreInterfaces'

import type {
    ContainerProps,
    ContainerHelper,
    Container,
    RelationUpdater,
    Provider,
    Resolver,
    ResolveDepsResult,
    CreateResolverOptions
} from 'reactive-di/i/coreInterfaces'

import ResolveHelper from 'reactive-di/core/ResolveHelper'
import createDepResolverCreator from 'reactive-di/core/createDepResolverCreator'
import getFunctionName from 'reactive-di/utils/getFunctionName'
import SimpleMap from 'reactive-di/utils/SimpleMap'

function disposeResolver(resolver: Resolver): void {
    resolver.dispose()
}

class DefaultContainer {
    _parent: ?Container;
    createDepResolver: (rec: CreateResolverOptions, tags: Array<Tag>) => () => ResolveDepsResult;

    _resolverCache: Map<DependencyKey, Resolver>;
    _privateCache: Map<DependencyKey, Resolver>;
    _helper: ContainerHelper;

    _updater: RelationUpdater;
    _dependants: Array<Set<Provider>>;

    constructor(props: ContainerProps) {
        this._updater = props.updater
        this._dependants = this._updater.dependants

        this._helper = props.helper
        this._parent = props.parent || null

        this._privateCache = new SimpleMap()
        this._resolverCache = new SimpleMap()
        this.createDepResolver = createDepResolverCreator(new ResolveHelper(
            props.middlewares,
            this
        ))
    }

    delete(annotatedDep: DependencyKey): void {
        this._resolverCache.delete(annotatedDep)
        const resolver: ?Resolver = this._privateCache.get(annotatedDep);
        if (resolver) {
            resolver.dispose()
        }
        this._privateCache.delete(annotatedDep)
    }

    dispose(): void {
        this._privateCache.forEach(disposeResolver)
        this._helper.removeContainer(this)
    }

    get(annotatedDep: DependencyKey): any {
        return this.getResolver(annotatedDep).resolve()
    }

    getResolver(annotatedDep: DependencyKey): Resolver {
        let resolver: ?Resolver = this._resolverCache.get(annotatedDep);
        if (!resolver) {
            const provider: ?Provider = this._helper.createProvider(annotatedDep, !!this._parent);
            if (provider) {
                this._updater.begin(provider)
                resolver = provider.createResolver((this: Container))
                this._updater.end(provider)
                this._privateCache.set(annotatedDep, resolver)
            } else {
                if (!this._parent) {
                    throw new Error(
                        `Can't find annotation for ${getFunctionName(annotatedDep)}`
                    )
                }
                resolver = this._parent.getResolver(annotatedDep)
            }
            this._resolverCache.set(annotatedDep, resolver)
        } else if (this._dependants.length) {
            this._updater.inheritRelations(resolver.provider)
        }

        return resolver
    }
}

export default function createDefaultContainer(props: ContainerProps): Container {
    return new DefaultContainer(props)
}
