/* @flow */
import BaseProvider from 'reactive-di/core/BaseProvider'
import createManagerFactory from 'reactive-di/core/createManagerFactory'
import defaultPlugins from 'reactive-di/plugins/defaultPlugins'
import SimpleMap from 'reactive-di/utils/SimpleMap'
import SimpleSet from 'reactive-di/utils/SimpleSet'

import {
    fastCall,
    fastCreateObject
} from 'reactive-di/utils/fastCall'

export {
    fastCall,
    fastCreateObject,

    SimpleSet,
    SimpleMap,

    BaseProvider,
    createManagerFactory,
    defaultPlugins
}
