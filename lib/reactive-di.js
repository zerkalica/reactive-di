/* @flow */

import type {
    Dependency,
    Annotation
} from 'reactive-di/i/annotationInterfaces'

import type {
    CreateDiProps
} from 'reactive-di/i/nodeInterfaces'

declare module 'reactive-di' {
    declare class ReactiveDi {
        (pluginsConfig: Array<Plugin>): ReactiveDi;
        create(config: Array<Annotation>): ReactiveDi;
        get(annotatedDep: Dependency): any;
    }
}
