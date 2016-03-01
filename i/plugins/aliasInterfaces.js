/* @flow */
import type {Annotation} from 'reactive-di/i/annotationInterfaces'
import type {DepBase} from 'reactive-di/i/nodeInterfaces'

export type AliasAnnotation<Source: Function, Target: Function> = {
    kind: 'alias';
    source: Source;
    target: Target;
}
