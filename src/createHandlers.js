// @flow

import type {RdiMeta, IHandler, RdiMetaType} from 'reactive-di/common'
import type {CreateStyleSheet, CreateWidget} from 'reactive-di/interfaces/component'

import SourceHandler from 'reactive-di/handlers/SourceHandler'
import DerivableHandler from 'reactive-di/handlers/DerivableHandler'
import ServiceHandler from 'reactive-di/handlers/ServiceHandler'
import ThemeHandler from 'reactive-di/handlers/ThemeHandler'
import StatusHandler from 'reactive-di/handlers/StatusHandler'
import AbstractHandler from 'reactive-di/handlers/AbstractHandler'
import ComponentHandler from 'reactive-di/handlers/ComponentHandler'

export default function createHandlers(
    createWidget?: CreateWidget<*, *, *>,
    createStyleSheet?: CreateStyleSheet
): Map<RdiMetaType, IHandler> {
    const plugins: [RdiMetaType, IHandler][] = [
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
