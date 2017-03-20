// @flow

export const setterKey = Symbol('rdi:setter')

export type IRawArg = (Function | {[id: string]: Function})

export type IDepRegister = Function | [Function, Function]

export type ResultOf<F> = _ResultOf<*, F>
type _ResultOf<V, F: (...x: any[]) => V> = V // eslint-disable-line

// @todo Replace to $Shape<V> after fix bug https://github.com/facebook/flow/issues/3016
// export type IShape<V: Object> = any // eslint-disable-line
