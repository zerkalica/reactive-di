/* @flow */
import type {
    Tag,
    DependencyKey
} from 'reactive-di'

import SimpleMap from 'reactive-di/utils/SimpleMap'

export default function normalizeMiddlewares(
    raw: Array<[DependencyKey, Array<Tag|DependencyKey>]>
): Map<DependencyKey|Tag, Array<DependencyKey>> {
    const middlewareMap: Map<DependencyKey|Tag, Array<DependencyKey>> = new SimpleMap()

    for (let i = 0, l = raw.length; i < l; i++) {
        const [middleware, loggableDeps] = raw[i]
        for (let j = 0, k = loggableDeps.length; j < k; j++) {
            const tagOrDep: Tag|DependencyKey = loggableDeps[j]
            let middlewares: ?Array<DependencyKey> = middlewareMap.get(tagOrDep)
            if (!middlewares) {
                middlewares = []
                middlewareMap.set(tagOrDep, middlewares)
            }
            middlewares.push(middleware)
        }
    }

    return middlewareMap
}
