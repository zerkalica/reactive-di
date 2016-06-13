/* @flow */

import {
    createManagerFactory,
    defaultPlugins
} from 'reactive-di/index'

import type {
    Tag,
    ConfigItem,
    DependencyKey,
    ContainerManager,
    CreateContainerManager
} from 'reactive-di'

export function createContainer(
    config?: Array<ConfigItem>,
    raw?: Array<[DependencyKey, Array<Tag|DependencyKey>]>
): ContainerManager {
    const createContainterManager: CreateContainerManager
        = createManagerFactory(defaultPlugins)
    const cm: ContainerManager = createContainterManager(config)
        .setMiddlewares(raw)

    return cm
}
