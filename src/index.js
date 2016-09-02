// @flow

import Di from 'reactive-di/Di'
import createReactWidgetFactory from 'reactive-di/adapters/createReactWidgetFactory'
import derivableAtomAdapter from 'reactive-di/adapters/derivableAtomAdapter'
import BaseModel from 'reactive-di/utils/BaseModel'
import Updater, {UpdaterStatus} from 'reactive-di/Updater'

import createHandlers from 'reactive-di/createHandlers'

export type {
    RegisterDepItem,
    Key,
    ResultOf
} from 'reactive-di/interfaces/deps'

export type {
    SrcComponent,
    StyleSheet,
    RawStyleSheet,
    CreateStyleSheet,
    CreateWidget
} from 'reactive-di/interfaces/component'

export type {
    Adapter,
    Derivable,
    Atom,
    LifeCycle
} from 'reactive-di/interfaces/atom'

export type {
    MultiUpdate,
    SingleUpdate
} from 'reactive-di/interfaces/updater'

export {
    Di,
    createHandlers,
    Updater,
    UpdaterStatus,
    BaseModel,
    derivableAtomAdapter,
    createReactWidgetFactory
}
