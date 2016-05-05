/* @flow */

import {
    createManagerFactory,
    defaultPlugins,
    createHotRelationUpdater,
    createDummyRelationUpdater
} from 'reactive-di/index'

import type {
    Tag,
    DependencyKey,
    RawAnnotation,
    Container,
    ContainerManager,
    CreateContainerManager
} from 'reactive-di/i/coreInterfaces'

export function createContainer(
    config?: Array<RawAnnotation|DependencyKey>,
    raw?: Array<[DependencyKey, Array<Tag|DependencyKey>]>,
    isHot: ?boolean = false
): Container {
    const createContainterManager: CreateContainerManager
        = createManagerFactory(
            defaultPlugins,
            isHot ? createHotRelationUpdater : createDummyRelationUpdater
        );
    const cm: ContainerManager = createContainterManager(config)
        .setMiddlewares(raw);

    return cm.createContainer()
}
