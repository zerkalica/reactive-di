/* @flow */

import type {
    RawAnnotation,
    DepItem,
    MetadataDriver
} from 'reactive-di'

import createMetadataDriver from 'reactive-di/utils/createMetadataDriver'

const paramtypes: MetadataDriver<Array<DepItem>> = createMetadataDriver('design:paramtypes');
const rdi: MetadataDriver<RawAnnotation> = createMetadataDriver('design:reactive-di');

export {
    paramtypes,
    rdi
}
