/* @flow */
import type {
    Tag,
    DepItem,
    DependencyKey,
    Dependency
} from 'reactive-di/i/coreInterfaces'

export type ValueAnnotation = {
    kind: 'value';
    target: DependencyKey;
    tags?: Array<Tag>;
    value: any;
}

export type AliasAnnotation = {
    kind: 'alias';
    target: DependencyKey;
    tags?: Array<Tag>;
    alias: DependencyKey;
}

export type AggregateAnnotation = {
    kind: 'aggregate';
    target: DependencyKey;
    tags: Array<Tag>;
}

export type ComposeAnnotation = {
    kind: 'compose';
    target: DependencyKey;
    dep?: Dependency;
    tags?: Array<Tag>;
    deps: Array<DepItem>;
}

export type FactoryAnnotation = {
    kind: 'factory';
    target: DependencyKey;
    dep?: Dependency;
    tags?: Array<Tag>;
    deps: Array<DepItem>;
}

export type ClassAnnotation = {
    kind: 'klass';
    target: DependencyKey;
    dep?: Dependency;
    tags?: Array<Tag>;
    deps: Array<DepItem>;
}
