/* @flow */
import type {
    Plugin,
    Annotation,
    Tag,
    DependencyKey,
    DepItem,
    ArgumentHelper,
    ArgsObject,
    Container,
    RelationUpdater,
    Provider,
    AnnotationMap
} from 'reactive-di'

import ArgumentHelperImpl from 'reactive-di/core/ArgumentHelper'
import getFunctionName from 'reactive-di/utils/getFunctionName'
import SimpleMap from 'reactive-di/utils/SimpleMap'

function disposeResolver(provider: Provider): void {
    provider.dispose()
    provider.isDisposed = true // eslint-disable-line
}

export default class DiContainer {
    _parent: ?Container;

    _providerCache: Map<DependencyKey, Provider>;
    _privateCache: Map<DependencyKey, Provider>;

    _dispose: () => void;
    _middlewares: Map<DependencyKey|Tag, Array<DependencyKey>>;
    _updater: RelationUpdater;
    _plugins: Map<string, Plugin>;
    _annotations: AnnotationMap;
    initState: Map<string, any>;
    _parentChain: Container[];

    constructor(
        dispose: () => void,
        middlewares: Map<DependencyKey|Tag, Array<DependencyKey>>,
        updater: RelationUpdater,
        plugins: Map<string, Plugin>,
        annotations: AnnotationMap,
        parent: ?Container,
        initState: Map<string, any>
    ) {
        this._dispose = dispose
        this.initState = initState
        this._middlewares = middlewares
        this._updater = updater
        this._plugins = plugins
        this._annotations = annotations
        this._parent = parent || null
        this._privateCache = new SimpleMap()
        this._providerCache = new SimpleMap()

        const parents: Container[] = this._parentChain = []
        let current: ?Container = parent
        while (current) {
            parents.push(current)
            current = current._parent
        }
    }

    _getMiddlewares(target: DependencyKey, tags: Array<Tag>): ?Array<Provider> {
        const {_middlewares: middlewares} = this
        const ids: Array<DependencyKey|Tag> = [target].concat(tags)
        const mdls: Array<Provider> = []
        for (let i = 0, l = ids.length; i < l; i++) {
            const depMiddlewares: ?Array<DependencyKey> = middlewares.get(ids[i]);
            if (depMiddlewares) {
                let m = mdls.length
                for (let j = 0, k = depMiddlewares.length; j < k; j++) {
                    mdls[m] = this.getProvider(depMiddlewares[j])
                    m = m + 1
                }
                mdls.length = m
            }
        }

        return mdls.length ? mdls : null
    }

    _getDeps(deps: Array<DepItem>): {
        deps: Array<Provider>;
        depNames: ?Array<string>;
    } {
        let depNames: ?Array<string> = null
        const resolvedDeps: Array<Provider> = new Array(deps.length)
        const l: number = deps.length
        if (
            l === 1
            && typeof deps[0] === 'object'
        ) {
            const argsObject: ArgsObject = (deps[0]: any)
            const keys = Object.keys(argsObject)
            const k = keys.length
            resolvedDeps.length = k
            depNames = new Array(k)
            for (let i = 0; i < k; i++) {
                const key = keys[i]
                resolvedDeps[i] = this.getProvider(argsObject[key])
                depNames[i] = key
            }
        } else {
            for (let i = 0; i < l; i++) {
                const dep: Provider =
                    this.getProvider(((deps: any): Array<DependencyKey>)[i])
                resolvedDeps[i] = dep
            }
        }

        return {
            deps: resolvedDeps,
            depNames
        }
    }

    createArgumentHelper(annotation: Annotation): ArgumentHelper {
        const {deps, depNames} = this._getDeps(annotation.deps || [])
        if (!annotation.tags) {
            throw new Error('Annotation without tags')
        }

        return new ArgumentHelperImpl(
            annotation.target,
            deps,
            depNames,
            this._getMiddlewares(annotation.target, annotation.tags)
        )
    }

    delete(key: DependencyKey): void {
        this._providerCache.delete(key)
        const provider: ?Provider = this._privateCache.get(key);
        if (provider) {
            provider.dispose()
        }
        this._privateCache.delete(key)
    }

    dispose(): void {
        this._privateCache.forEach(disposeResolver)
        this._dispose()
    }

    get(key: DependencyKey): any {
        const dep = this.getProvider(key)
        if (!dep.isCached) {
            dep.update()
            dep.isCached = true
        }

        return dep.value
    }

    beginInitialize(key: DependencyKey, provider: Provider): void {
        this._privateCache.set(key, provider)
        this._providerCache.set(key, provider)
        this._updater.begin(provider)
    }

    getOwnProvider(key: DependencyKey, annotation: Annotation): Provider {
        let provider: ?Provider = this._providerCache.get(key)
        if (provider) {
            if (this._updater.length) {
                this._updater.addCached(provider)
            }
            return provider
        }

        const plugin: ?Plugin = this._plugins.get(annotation.kind)
        if (!plugin) {
            throw new Error(
                `Provider not found for annotation ${getFunctionName(annotation.target)}`
            )
        }
        const updater: RelationUpdater = this._updater
        const l: number = updater.length

        provider = plugin.createProvider(
            annotation,
            this
        )

        if (l !== updater.length) {
            updater.end(provider)
        }

        this._providerCache.set(key, provider)

        return provider
    }

    getProvider(key: DependencyKey): Provider {
        let provider: ?Provider = this._providerCache.get(key)
        if (provider) {
            if (this._updater.length) {
                this._updater.addCached(provider)
            }
            return provider
        }

        let container: Container = this
        let parentAnnotation: ?Annotation
        const chain: Container[] = this._parentChain
        for (let i = 0, l = chain.length; i < l; i++) {
            container = chain[i]
            parentAnnotation = container._annotations.get(key)
            if (parentAnnotation) {
                break
            }
        }

        const currentAnnotation: ?Annotation = this._annotations.get(key)
        let annotation: ?Annotation = parentAnnotation || currentAnnotation
        const cntr: Container = currentAnnotation ? this : container
        if (!annotation) {
            annotation = this._annotations.getFromDriver(key)
            if (!annotation) {
                throw new Error(
                    `Can't find annotation for ${getFunctionName(key)}`
                )
            }
        }

        provider = (cntr.getOwnProvider(key, annotation): any)
        if (this !== cntr) {
            this._providerCache.set(key, provider)
        }

        return provider
    }
}
