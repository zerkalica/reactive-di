/* @flow */

import type {
    Tag,
    RawAnnotation,
    DepItem,
    Dependency,
    DependencyKey
} from 'reactive-di'

declare module 'reactive-di/configurations' {
    declare function alias(aliasTarget: DependencyKey): RawAnnotation;
    declare function klass(...deps: Array<DepItem>): RawAnnotation;
    declare function compose(...deps: Array<DepItem>): RawAnnotation;
    declare function factory(...deps: Array<DepItem>): RawAnnotation;
    declare function tag(annotation: RawAnnotation, ...tags: Array<Tag>): RawAnnotation;
    declare function value(val?: any): RawAnnotation;
}
