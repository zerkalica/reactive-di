// @flow

import Di from './Di'

import type {
    SrcComponent
} from './adapters/Adapter'

const Component = (((class {}): any): Class<SrcComponent<P, S>>)

export {
    Component,
    Di
}
