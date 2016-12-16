// @flow

import React from 'React'
import {component} from 'reactive-di/annotations'
import {DiFactory, ReactComponentFactory} from 'reactive-di/index'

export function createDi() {
    function defaultErrorComponent(
        {error}: {error: Error}
    ) {
        return <div>{error.message}</div>
    }
    component({})(defaultErrorComponent)

    const diFactory = new DiFactory({
        defaultErrorComponent,
        themeFactory: (0: any),
        componentFactory: new ReactComponentFactory(React)
    })

    return diFactory
}
