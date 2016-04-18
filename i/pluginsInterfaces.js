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

export type ValueAnnotation = Annotation & {
    kind: 'value';
    value: any;
}

export type ValueProvider = Provider<ValueAnnotation> & {
    kind: 'value';
    set(value: any): boolean;
}
