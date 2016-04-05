/* @flow */
import type {AliasAnnotation} from 'reactive-di/i/pluginsInterfaces'
import type {
    Context,
    ResolverCreator
} from 'reactive-di/i/nodeInterfaces'

// depends on meta
// implements Plugin
export default class AliasPlugin {
    kind: 'alias' = 'alias';

    create(annotation: AliasAnnotation, acc: Context): ResolverCreator { // eslint-disable-line
        return acc.getResolverCreator(annotation.alias)
    }

    finalize(dep: ResolverCreator, annotation: AliasAnnotation, acc: Context): void { // eslint-disable-line
    }
}
