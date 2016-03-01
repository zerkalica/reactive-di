/* @flow */
import type {AliasAnnotation} from 'reactive-di/i/plugins/aliasInterfaces'

export function alias<Source: Function, Target: Function>(
    source: Source,
    target: Target
): AliasAnnotation<Source, Target> {
    return {
        kind: 'alias',
        source,
        target
    }
}
