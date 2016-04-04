/* @flow */
import type {Plugin} from 'reactive-di/i/nodeInterfaces'
import FacetPlugin from 'reactive-di/plugins/facet/FacetPlugin'
import FactoryPlugin from 'reactive-di/plugins/factory/FactoryPlugin'
import ClassPlugin from 'reactive-di/plugins/class/ClassPlugin'
import ValuePlugin from 'reactive-di/plugins/value/ValuePlugin'
import AliasPlugin from 'reactive-di/plugins/alias/AliasPlugin'

const plugins: Array<Plugin> = [
    new FacetPlugin(),
    new FactoryPlugin(),
    new ClassPlugin(),
    new ValuePlugin(),
    new AliasPlugin()
];

export default plugins
