/* @flow */
import BaseProvider from 'reactive-di/core/BaseProvider'
import ReactiveDi from 'reactive-di/core/ReactiveDi'
import defaultPlugins from 'reactive-di/plugins/defaultPlugins'
import SimpleMap from 'reactive-di/utils/SimpleMap'
import createHotRelationUpdater from 'reactive-di/core/updaters/createHotRelationUpdater'
import createDummyRelationUpdater from 'reactive-di/core/updaters/createDummyRelationUpdater'

export {
    createHotRelationUpdater,
    createDummyRelationUpdater,
    SimpleMap,
    BaseProvider,
    ReactiveDi,
    defaultPlugins
}
