// @flow

import type {IHandler} from 'reactive-di/core/common'
import type {CreateStyleSheet} from 'reactive-di/interfaces/component'

import SourceHandler from 'reactive-di/handlers/SourceHandler'
import DerivableHandler from 'reactive-di/handlers/DerivableHandler'
import ServiceHandler from 'reactive-di/handlers/ServiceHandler'
import ThemeHandler from 'reactive-di/handlers/ThemeHandler'
import StatusHandler from 'reactive-di/handlers/StatusHandler'
import AbstractHandler from 'reactive-di/handlers/AbstractHandler'

const dummyThemeHandler: IHandler = {
    handle() {
        throw new Error('Can\'t create theme: provide theme handler to di')
    }
}

export default function createHandlers(
    createStyleSheet?: ?CreateStyleSheet
): {[id: string]: IHandler} {
    return {
        abstract: new AbstractHandler(),
        source: new SourceHandler(),
        derivable: new DerivableHandler(),
        service: new ServiceHandler(),
        status: new StatusHandler(),
        theme: createStyleSheet ? new ThemeHandler(createStyleSheet) : dummyThemeHandler
    }
}
