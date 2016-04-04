/* @flow */
import type {
    Tag,
    SimpleMap,
    Dependency,
    Annotation
} from 'reactive-di/i/annotationInterfaces'

import type {
    Context,
    Plugin,
    ResolvableDep,
    ResolveDepsResult,
    CreateResolverOptions
} from 'reactive-di/i/nodeInterfaces'

import ResolveHelper from 'reactive-di/core/ResolveHelper'
import getFunctionName from 'reactive-di/utils/getFunctionName'
import normalizeConfiguration from 'reactive-di/core/normalizeConfiguration'
import annotationSingleton from 'reactive-di/core/annotationSingleton'

export default class DiContext {
    _helper: ResolveHelper;

    _cache: Map<Dependency, ResolvableDep>;
    _plugins: SimpleMap<string, Plugin>;
    _annotations: Map<Dependency, Annotation>;
    _parent: ?DiContext;

    parents: Array<ResolvableDep>;

    constructor(
        plugins: SimpleMap<string, Plugin>,
        parent?: DiContext,
        config?: Array<Annotation>
    ) {
        this._cache = new Map()
        this.parents = []

        this._plugins = plugins;

        this._parent = parent
        const rec = normalizeConfiguration(config || annotationSingleton)
        this._annotations = rec.annotations

        this._helper = new ResolveHelper(
            rec.middlewares,
            (annotatedDep) => this.resolve(annotatedDep)
        )
    }

    create(config: Array<Annotation>): Context {
        return new DiContext(
            this._plugins,
            this,
            config
        )
    }

    hasDep(annotatedDep: Dependency): boolean {
        return this._annotations.has(annotatedDep)
    }

    resolve(annotatedDep: Dependency): ResolvableDep {
        const {_cache: cache} = this
        let dep: ?ResolvableDep = cache.get(annotatedDep);
        if (!dep) {
            if (this._parent && this._parent.hasDep(annotatedDep)) {
                dep = this._parent.resolve(annotatedDep)
            } else {
                const annotation: ?Annotation = this._annotations.get(annotatedDep);
                if (!annotation) {
                    throw new Error(`Can't find annotation for ${getFunctionName(annotatedDep)}`)
                }
                const plugin: ?Plugin = this._plugins[annotation.kind];
                if (!plugin) {
                    throw new Error(
                        `Plugin not found for annotation ${getFunctionName(annotation.target)}`
                    )
                }
                dep = plugin.create(annotation, this)
                cache.set(annotatedDep, dep)
                this.parents.push(dep)
                plugin.finalize(dep, annotation, this)
                this.parents.pop()
            }
        }

        return dep
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
