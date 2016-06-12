/* @flow */
import type {
    Plugin
} from 'reactive-di'

import ComposePlugin from 'reactive-di/plugins/compose/ComposePlugin'
import FactoryPlugin from 'reactive-di/plugins/factory/FactoryPlugin'
import ClassPlugin from 'reactive-di/plugins/class/ClassPlugin'
import ValuePlugin from 'reactive-di/plugins/value/ValuePlugin'
import AliasPlugin from 'reactive-di/plugins/alias/AliasPlugin'

const plugins: Array<Plugin> = [
    new ComposePlugin(),
    new FactoryPlugin(),
    new ClassPlugin(),
    new ValuePlugin(),
    new AliasPlugin()
];

export default plugins
