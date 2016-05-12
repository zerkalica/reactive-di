/* @flow */

import type {
    Tag,
    DepItem,
    Dependency
} from 'reactive-di'

declare module 'reactive-di/annotations' {
    declare function alias(aliasTarget: Dependency): (target: Dependency) => Dependency;
    declare function klass<V: Function>(...deps: Array<DepItem>): (target: V) => V;
    declare function compose<V: Function>(...deps: Array<DepItem>): (target: V) => V;
    declare function factory<V: Function>(...deps: Array<DepItem>): (target: V) => V;
    declare function tag(...tags: Array<Tag>): (target: Dependency) => Dependency;
    declare function valueAnn(val?: any): (target: Dependency) => Dependency;
}
