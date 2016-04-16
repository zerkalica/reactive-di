/* @flow */
import BaseProvider from 'reactive-di/core/BaseProvider'
import createManagerFactory from 'reactive-di/core/createManagerFactory'
import defaultPlugins from 'reactive-di/plugins/defaultPlugins'
import SimpleMap from 'reactive-di/utils/SimpleMap'
import createHotRelationUpdater from 'reactive-di/core/updaters/createHotRelationUpdater'
import createDummyRelationUpdater from 'reactive-di/core/updaters/createDummyRelationUpdater'
import annotationDriver from 'reactive-di/core/annotationDriver'
import {
    fastCall,
    fastCreateObject,
    fastCallMethod
} from 'reactive-di/utils/fastCall'

export {
    fastCall,
    fastCreateObject,
    fastCallMethod,
    annotationDriver,
    createHotRelationUpdater,
    createDummyRelationUpdater,
    SimpleMap,
    BaseProvider,
    createManagerFactory,
    defaultPlugins
}
