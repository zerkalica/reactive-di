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
        componentFactory: new ReactComponentFactory(React)
    })

    return diFactory
}
