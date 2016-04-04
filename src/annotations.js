/* @flow */

import {facetAnn as facet} from 'reactive-di/plugins/facet/facet'
import {factoryAnn as factory} from 'reactive-di/plugins/factory/factory'
import {klassAnn as klass} from 'reactive-di/plugins/class/klass'
import {valueAnn as value} from 'reactive-di/plugins/value/value'
import {aliasAnn as alias} from 'reactive-di/plugins/alias/alias'
import {middlewareAnn as middleware} from 'reactive-di/plugins/middleware/middleware'

export {
    alias,
    value,
    facet,
    factory,
    middleware,
    klass
}
