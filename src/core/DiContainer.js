/* @flow */
import type {
    Annotation,
    Tag,
    DependencyKey,
    DepItem,
    ArgumentHelper,
    ArgsObject,
    Container,
    RelationUpdater,
    Plugin,
    Provider,
    DepAnnotation
} from 'reactive-di/i/coreInterfaces'
import type AnnotationMap from 'reactive-di/core/AnnotationMap'

import ArgumentHelperImpl from 'reactive-di/core/ArgumentHelper'
import getFunctionName from 'reactive-di/utils/getFunctionName'
import SimpleMap from 'reactive-di/utils/SimpleMap'

function disposeResolver(provider: Provider): void {
    provider.dispose()
}

export default class DefaultContainer {
    _providerCache: Map<DependencyKey, Provider>;
    _privateCache: Map<DependencyKey, Provider>;

    _dispose: () => void;
    _middlewares: Map<DependencyKey|Tag, Array<DependencyKey>>;
    _updater: RelationUpdater;
    _plugins: Map<string, Plugin>;
    _annotations: AnnotationMap;
    _parent: ?Container;

    constructor(
        dispose: () => void,
        middlewares: Map<DependencyKey|Tag, Array<DependencyKey>>,
        updater: RelationUpdater,
        plugins: Map<string, Plugin>,
        annotations: AnnotationMap,
        parent: ?Container
    ) {
        this._dispose = dispose
        this._middlewares = middlewares
        this._updater = updater
        this._plugins = plugins
        this._annotations = annotations
        this._parent = parent || null
        this._privateCache = new SimpleMap()
        this._providerCache = new SimpleMap()
    }

    _getMiddlewares(target: DependencyKey, tags: Array<Tag>): ?Array<Provider> {
        const {_middlewares: middlewares} = this
        const ids: Array<DependencyKey|Tag> = [target].concat(tags);
        const mdls: Array<Provider> = [];
        for (let i = 0, l = ids.length; i < l; i++) {
            const depMiddlewares: ?Array<DependencyKey> = middlewares.get(ids[i]);
            if (depMiddlewares) {
                for (let j = 0, k = depMiddlewares.length; j < k; j++) {
                    mdls[mdls.length++] = this.getProvider(depMiddlewares[j])
                }
            }
        }

        return mdls.length ? mdls : null
    }

    _getDeps(deps: Array<DepItem>): {
        deps: Array<Provider>;
        depNames: ?Array<string>;
    } {
        let depNames: ?Array<string>;
        const resolvedDeps: Array<Provider> = new Array(deps.length);
        const l: number = deps.length;
        if (
            l === 1
            && typeof deps[0] === 'object'
        ) {
            const argsObject: ArgsObject = (deps[0]: any);
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
            depNames = null
            for (let i = 0; i < l; i++) {
                const dep: Provider =
                    this.getProvider(((deps: any): Array<DependencyKey>)[i]);
                resolvedDeps[i] = dep
            }
        }

        return {
            deps: resolvedDeps,
            depNames
        }
    }

    createArgumentHelper(annotation: DepAnnotation): ArgumentHelper {
        const {deps, depNames} = this._getDeps(annotation.deps)
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

    delete(annotatedDep: DependencyKey): void {
        this._providerCache.delete(annotatedDep)
        const provider: ?Provider = this._privateCache.get(annotatedDep);
        if (provider) {
            provider.dispose()
        }
        this._privateCache.delete(annotatedDep)
    }

    dispose(): void {
        this._privateCache.forEach(disposeResolver)
        this._dispose()
    }

    get(annotatedDep: DependencyKey): any {
        return this.getProvider(annotatedDep).get()
    }

    getProvider(annotatedDep: DependencyKey): Provider {
        let provider: ?Provider = this._providerCache.get(annotatedDep);

        if (provider) {
            if (this._updater.length) {
                this._updater.addCached(provider)
            }

            return provider
        }

        const annotation: ?Annotation = this._annotations.get(annotatedDep);
        if (!annotation) {
            if (!this._parent) {
                throw new Error(
                    `Can't find annotation for ${getFunctionName(annotatedDep)}`
                )
            }
            provider = this._parent.getProvider(annotatedDep)
            this._providerCache.set(annotatedDep, provider)
            return provider
        }

        const plugin: ?Plugin = this._plugins.get(annotation.kind);
        if (!plugin) {
            throw new Error(
                `Provider not found for annotation ${getFunctionName(annotation.target)}`
            )
        }

        provider = plugin.create(annotation, (this: Container))
        this._updater.begin(provider)
        provider.init((this: Container))
        this._updater.end(provider)

        this._providerCache.set(annotatedDep, provider)
        this._privateCache.set(annotatedDep, provider)

        return provider
    }
}
