/* @flow */
import type {AliasAnnotation} from 'reactive-di/i/pluginsInterfaces'
import type {
    Context,
    ResolvableDep
} from 'reactive-di/i/nodeInterfaces'

// depends on meta
// implements Plugin
export default class AliasPlugin {
    kind: 'alias' = 'alias';

    create(annotation: AliasAnnotation, acc: Context): ResolvableDep { // eslint-disable-line
        return acc.resolve(annotation.alias)
    }

    finalize(dep: ResolvableDep, annotation: AliasAnnotation, acc: Context): void { // eslint-disable-line
    }
}
