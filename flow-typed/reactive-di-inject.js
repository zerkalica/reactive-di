/* @flow */

import type {
    DepItem
} from 'reactive-di'

declare module 'reactive-di/inject' {
    declare var exports: <V: Function>(deps: Array<DepItem>, target: V) => void;
}
