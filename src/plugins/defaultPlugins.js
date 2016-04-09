/* @flow */

import type {
    Plugin
} from 'reactive-di/i/coreInterfaces'

import FacetPlugin from 'reactive-di/plugins/facet/FacetPlugin'
import FactoryPlugin from 'reactive-di/plugins/factory/FactoryPlugin'
import ClassPlugin from 'reactive-di/plugins/class/ClassPlugin'
import ValuePlugin from 'reactive-di/plugins/value/ValuePlugin'
import AliasPlugin from 'reactive-di/plugins/alias/AliasPlugin'

const plugins: Array<Plugin> = [
    FacetPlugin,
    FactoryPlugin,
    ClassPlugin,
    ValuePlugin,
    AliasPlugin
];

export default plugins
