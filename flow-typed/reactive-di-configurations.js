/* @flow */

import type {
    Tag,
    RawAnnotation,
    DepItem,
    Dependency,
    DependencyKey
} from 'reactive-di/reactive-di-common'

declare module 'reactive-di/configurations' {
    declare function alias(target: Dependency, aliasTarget: DependencyKey): RawAnnotation;
    declare function klass(arget: Dependency, ...deps: Array<DepItem>): RawAnnotation;
    declare function compose(target: Function, ...deps: Array<DepItem>): RawAnnotation;
    declare function factory(target: Function, ...deps: Array<DepItem>): RawAnnotation;
    declare function tag(annotation: RawAnnotation, ...tags: Array<Tag>): RawAnnotation;
    declare function value(target: Dependency, val?: any): RawAnnotation;
}
