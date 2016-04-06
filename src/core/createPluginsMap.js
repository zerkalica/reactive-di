/* @flow */

import type {Plugin} from 'reactive-di/i/nodeInterfaces'

export default function createProvidersMap(
    plugins: Array<Plugin>
): Map<string, Plugin> {
    const pluginMap: Map<string, Plugin> = new Map();
    for (let i = 0, l = plugins.length; i < l; i++) {
        const plugin: Plugin = plugins[i];
        pluginMap.set(plugin.kind, plugin)
    }
    return pluginMap
}
