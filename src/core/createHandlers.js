// @flow

import type {RdiMeta, IHandler, RdiMetaType} from './common'
import type {CreateStyleSheet, CreateWidget} from '../interfaces/component'

import SourceHandler from './plugins/SourceHandler'
import DerivableHandler from './plugins/DerivableHandler'
import ServiceHandler from './plugins/ServiceHandler'
import ThemeHandler from './plugins/ThemeHandler'
import StatusHandler from './plugins/StatusHandler'
import AbstractHandler from './plugins/AbstractHandler'
import ComponentHandler from './plugins/ComponentHandler'

export default function createHandlers(
    createWidget?: CreateWidget<*, *, *>,
    createStyleSheet?: CreateStyleSheet
): Map<RdiMetaType, IHandler<any, *>> {
    const plugins: [RdiMetaType, IHandler<any, *>][] = [
        ['abstract', new AbstractHandler()],
        ['source', new SourceHandler()],
        ['derivable', new DerivableHandler()],
        ['service', new ServiceHandler()],
        ['status', new StatusHandler()]
    ]
    if (createWidget) {
        plugins.push(['component', new ComponentHandler(createWidget)])

    }
    if (createStyleSheet) {
        plugins.push(['theme', new ThemeHandler(createStyleSheet)])
    }
    return new Map(plugins)
}
