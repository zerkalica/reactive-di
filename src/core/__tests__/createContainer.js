/* @flow */

import {
    createConfigProvider,
    defaultPlugins,
    createDummyRelationUpdater
} from 'reactive-di/index'

import type {
    Tag,
    DependencyKey,
    Annotation,
    Context,
    ContainerManager,
    CreateContainerManager
} from 'reactive-di/i/coreInterfaces'

export function createContainer(
    config?: Array<Annotation>,
    raw?: Array<[DependencyKey, Array<Tag|DependencyKey>]>
): Context {
    const createContainerManager: CreateContainerManager
        = createConfigProvider(defaultPlugins, createDummyRelationUpdater);
    const cm: ContainerManager = createContainerManager(config)
        .setMiddlewares(raw);

    return cm.createContainer()
}
