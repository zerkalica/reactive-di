/* @flow */
import type {
    RawAnnotation,
    Tag,
    Dependency
} from 'reactive-di'

import {
    rdi
} from 'reactive-di/core/annotationDriver'
import getFunctionName from 'reactive-di/utils/getFunctionName'

/**
 * Add tags to any configuration
 *
 * ### Example
 *
 * ```js
 * import {tag, klass} from 'reactive-di/configurations'
 *
 *  const configuration: Array<RawAnnotation> = [
 *    tag(klass(Engine), 'detail', 'machine')
 *  ];
 * ```
 */
export function tag(annotation: RawAnnotation, ...tags: Array<Tag>): RawAnnotation {
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
        const annotation: ?RawAnnotation = rdi.get(target);
        if (!annotation) {
            throw new Error(`RawAnnotation not found for ${getFunctionName(target)}`)
        }
        annotation.tags = (annotation.tags || []).concat(tags)

        return target
    }
}
