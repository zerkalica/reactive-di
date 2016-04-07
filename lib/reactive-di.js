/* @flow */

import type {
    Dependency,
    Annotation
} from 'reactive-di/i/annotationInterfaces'

import type {
    Plugin
} from 'reactive-di/i/nodeInterfaces'

declare module 'reactive-di' {
    declare class ReactiveDi {
        (
            pluginsConfig: Array<Plugin>|Map<string, Plugin>,
            config: Array<Annotation>,
            isHotReload?: boolean
        ): ReactiveDi;

        replace(annotatedDep: Dependency, annotation?: Annotation): void;
        create(config: Array<Annotation>): ReactiveDi;
        get(annotatedDep: Dependency): any;
    }
}
