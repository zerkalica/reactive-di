// @flow
import type {IContext} from './commonInterfaces'

export const setterKey = Symbol('rdi:setter')

export type IRawArg = (Function | {[id: string]: Function})

export type IDepRegister = Function | [Function, Function]

export interface IEntity {
    id: number;
    displayName: string;
    context: IContext;
    resolve(): void;
}

export type ICallerInfo<V> = {
    trace: string;
    opId: number;
    modelName: string;
    oldValue: ?V;
    newValue: V;
}

export interface ILogger {
    onError(error: Error, name: string): void;
    onSetValue<V>(info: ICallerInfo<V>): void;
}

export type ResultOf<F> = _ResultOf<*, F>
type _ResultOf<V, F: (...x: any[]) => V> = V // eslint-disable-line
