/* @flow */

import {composeAnn as compose} from 'reactive-di/plugins/compose/compose'
import {factoryAnn as factory} from 'reactive-di/plugins/factory/factory'
import {klassAnn as klass} from 'reactive-di/plugins/class/klass'
import {valueAnn as value} from 'reactive-di/plugins/value/value'
import {aliasAnn as alias} from 'reactive-di/plugins/alias/alias'
import {tagAnn as tag} from 'reactive-di/plugins/tag/tag'

export {
    alias,
    tag,
    value,
    compose,
    factory,
    klass
}
