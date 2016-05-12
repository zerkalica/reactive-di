/* @flow */

import type {
    MetadataDriver
} from 'reactive-di'

import createMetadataDriver from 'reactive-di/utils/createMetadataDriver'

const paramtypes: MetadataDriver = createMetadataDriver('design:paramtypes');
const rdi: MetadataDriver = createMetadataDriver('design:reactive-di');

export {
    paramtypes,
    rdi
}
