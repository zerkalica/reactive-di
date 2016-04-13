/* @flow */
import BaseProvider from 'reactive-di/core/BaseProvider'
import createConfigResolver from 'reactive-di/core/createConfigResolver'
import defaultPlugins from 'reactive-di/plugins/defaultPlugins'
import SimpleMap from 'reactive-di/utils/SimpleMap'
import createHotRelationUpdater from 'reactive-di/core/updaters/createHotRelationUpdater'
import createDummyRelationUpdater from 'reactive-di/core/updaters/createDummyRelationUpdater'
import annotationDriver from 'reactive-di/core/annotationDriver'
import createDefaultContainer from 'reactive-di/core/createDefaultContainer'

export {
    annotationDriver,
    createHotRelationUpdater,
    createDummyRelationUpdater,
    SimpleMap,
    BaseProvider,
    createDefaultContainer,
    createConfigResolver,
    defaultPlugins
}
