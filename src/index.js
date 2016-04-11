/* @flow */
import BaseProvider from 'reactive-di/core/BaseProvider'
import createConfigManagerFactory from 'reactive-di/core/createConfigManagerFactory'
import defaultPlugins from 'reactive-di/plugins/defaultPlugins'
import SimpleMap from 'reactive-di/utils/SimpleMap'
import createHotRelationUpdater from 'reactive-di/core/updaters/createHotRelationUpdater'
import createDummyRelationUpdater from 'reactive-di/core/updaters/createDummyRelationUpdater'
import annotationDriver from 'reactive-di/core/annotationDriver'

export {
    annotationDriver,
    createHotRelationUpdater,
    createDummyRelationUpdater,
    SimpleMap,
    BaseProvider,
    createConfigManagerFactory,
    defaultPlugins
}
