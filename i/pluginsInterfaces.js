/* @flow */
import type {
    Annotation,
    DependencyKey
} from 'reactive-di/i/coreInterfaces'

export type AliasAnnotation = Annotation & {
    kind: 'alias';
    alias: DependencyKey;
}

export type ComposeAnnotation = Annotation & {
    kind: 'compose';
}

export type FactoryAnnotation = Annotation & {
    kind: 'factory';
}

export type ClassAnnotation = Annotation & {
    kind: 'klass';
}

export type ValueAnnotation<V> = Annotation & {
    kind: 'value';
    value: V;
}
