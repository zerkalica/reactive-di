/* @flow */
import type {
    DepAnnotation,
    Annotation,
    Provider,
    Tag,
    DepItem,
    DependencyKey
} from 'reactive-di/i/coreInterfaces'

export type AliasAnnotation = Annotation & {
    kind: 'alias';
    alias: DependencyKey;
}

export type ComposeAnnotation = DepAnnotation & {
    kind: 'compose';
}

export type FactoryAnnotation = DepAnnotation & {
    kind: 'factory';
}

export type ClassAnnotation = DepAnnotation & {
    kind: 'klass';
}

export type ValueAnnotation<V> = Annotation & {
    kind: 'value';
    value: V;
}

export type ValueProvider<V> = Provider<V, ValueAnnotation, Provider> & {
    kind: 'value';
    set(value: V): boolean;
}
