/* @flow */

import type {Plugin} from 'reactive-di/i/nodeInterfaces'
import SafeMap from 'reactive-di/utils/SafeMap'

export default function createProvidersMap(
    plugins: Array<Plugin>
): Map<string, Plugin> {
    const pluginMap: Map<string, Plugin> = new SafeMap();
    for (let i = 0, l = plugins.length; i < l; i++) {
        const plugin: Plugin = plugins[i];
        pluginMap.set(plugin.kind, plugin)
    }
    return pluginMap
}
