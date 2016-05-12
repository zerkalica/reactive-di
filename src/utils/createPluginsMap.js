/* @flow */
import type {
    CreateContainerManager,
    CreatePlugin,
    Plugin
} from 'reactive-di'

import SimpleMap from 'reactive-di/utils/SimpleMap'

export default function createPluginsMap(
    createContainerManager: CreateContainerManager,
    plugins: Array<CreatePlugin>
): Map<string, Plugin> {
    const pluginMap: Map<string, Plugin> = new SimpleMap();
    for (let i = 0, l = plugins.length; i < l; i++) {
        const plugin: Plugin = plugins[i](createContainerManager);
        pluginMap.set(plugin.kind, plugin)
    }

    return pluginMap
}
