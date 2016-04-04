/* @flow */

import type {Plugin} from 'reactive-di/i/nodeInterfaces'
import type {SimpleMap} from 'reactive-di/i/annotationInterfaces'

export default function createPluginsMap(plugins: Array<Plugin>): SimpleMap<string, Plugin> {
    const pluginMap: SimpleMap<string, Plugin> = {};
    for (let i = 0, l = plugins.length; i < l; i++) {
        pluginMap[plugins[i].kind] = plugins[i]
    }
    return pluginMap
}
