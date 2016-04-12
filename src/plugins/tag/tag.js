/* @flow */
import type {
    Tag,
    Dependency
} from 'reactive-di/i/coreInterfaces'

import driver from 'reactive-di/core/annotationDriver'
import getFunctionName from 'reactive-di/utils/getFunctionName'

/**
 * Add tags to any configuration
 *
 * ### Example
 *
 * ```js
 * import {tag, klass} from 'reactive-di/configurations'
 *
 *  const configuration: Array<Annotation> = [
 *    tag(klass(Engine), 'detail', 'machine')
 *  ];
 * ```
 */
export function tag(annotation: Annotation, ...tags: Array<Tag>): Annotation {
    annotation.tags = (annotation.tags || []).concat(tags) // eslint-disable-line

    return annotation
}

/**
 * Add tags to any annotation
 *
 * ### Example
 *
 * ```js
 * import {tag, klass} from 'reactive-di/annotations'
 *
 *  @klass()
 *  @tag('car', 'machine')
 *  class Car {}
 * ```
 */
export function tagAnn(...tags: Array<Tag>): (target: Dependency) => Dependency {
    return function _tag(target: Dependency): Dependency {
        const annotation: ?Annotation = driver.getAnnotation(target);
        if (!annotation) {
            throw new Error(`Annotation not found for ${getFunctionName(target)}`)
        }
        annotation.tags = (annotation.tags || []).concat(tags)

        return target
    }
}
