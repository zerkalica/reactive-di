/* @flow */

import {
    createManagerFactory,
    defaultPlugins,
    createHotRelationUpdater,
    createDummyRelationUpdater
} from 'reactive-di/index'

import type {
    Tag,
    ConfigItem,
    DependencyKey,
    Container,
    ContainerManager,
    CreateContainerManager
} from 'reactive-di'

export function createContainer(
    config?: Array<ConfigItem>,
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
