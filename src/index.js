// @flow

import Di from './Di'
import createReactWidgetFactory from './adapters/createReactWidgetFactory'
import derivableAtomAdapter from './adapters/derivableAtomAdapter'
import BaseModel from './BaseModel'
import Updater, {UpdaterStatus} from './Updater'

import createHandlers from 'reactive-di/core/createHandlers'

export type {
    RegisterDepItem,
    Key,
    ResultOf
} from './interfaces/deps'

export type {
    SrcComponent,
    StyleSheet,
    RawStyleSheet,
    CreateStyleSheet,
    CreateWidget
} from './interfaces/component'

export type {
    Adapter,
    Derivable,
    Atom,
    LifeCycle
} from './interfaces/atom'

export type {
    MultiUpdate,
    SingleUpdate
} from './interfaces/updater'

export {
    Di,
    createHandlers,
    Updater,
    UpdaterStatus,
    BaseModel,
    derivableAtomAdapter,
    createReactWidgetFactory
}
