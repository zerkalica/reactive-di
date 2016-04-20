/* @flow */

import SimpleMap from 'reactive-di/utils/SimpleMap'

export default function createProvidersMap(
    plugins: Array<Plugin>
): Map<string, Plugin> {
    const pluginMap: Map<string, Plugin> = new SimpleMap();
    for (let i = 0, l = plugins.length; i < l; i++) {
        const plugin: Plugin = plugins[i];
        pluginMap.set(plugin.kind, plugin)
    }
    return pluginMap
}
