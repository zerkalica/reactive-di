/* @flow */

import type {
    MetadataDriver
} from 'reactive-di/i/coreInterfaces'

import createMetadataDriver from 'reactive-di/utils/createMetadataDriver'

const paramtypes: MetadataDriver = createMetadataDriver('design:paramtypes');
const rdi: MetadataDriver = createMetadataDriver('design:reactive-di');

export {
    paramtypes,
    rdi
}
