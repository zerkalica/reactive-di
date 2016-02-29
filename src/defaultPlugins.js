/* @flow */

import ClassPlugin from 'reactive-di/plugins/class/ClassPlugin'
import FactoryPlugin from 'reactive-di/plugins/factory/FactoryPlugin'
import LoaderPlugin from 'reactive-di/plugins/loader/LoaderPlugin'
import MetaPlugin from 'reactive-di/plugins/meta/MetaPlugin'
import ModelPlugin from 'reactive-di/plugins/model/ModelPlugin'
import ObservablePlugin from 'reactive-di/plugins/observable/ObservablePlugin'
import ResetPlugin from 'reactive-di/plugins/loader/ResetPlugin'
import SyncSetterPlugin from 'reactive-di/plugins/setter/SyncSetterPlugin'
import AsyncSetterPlugin from 'reactive-di/plugins/setter/AsyncSetterPlugin'
import type {Plugin} from 'reactive-di/i/pluginInterfaces'

const defaultPlugins: Array<Plugin> = [
    new ClassPlugin(),
    new FactoryPlugin(),
    new AsyncSetterPlugin(),
    new SyncSetterPlugin(),
    new ModelPlugin(),
    new LoaderPlugin(),
    new ResetPlugin(),
    new ObservablePlugin(),
    new MetaPlugin()
];

export default defaultPlugins
