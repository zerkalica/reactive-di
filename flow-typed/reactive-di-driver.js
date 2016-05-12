/* @flow */

import type {
    DepItem,
    RawAnnotation,
    MetadataDriver
} from 'reactive-di'

declare module 'reactive-di/driver' {
    declare var paramtypes: MetadataDriver<Array<DepItem>>;
    declare var rdi: MetadataDriver<RawAnnotation>;
}
