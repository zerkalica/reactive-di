// @flow
import type {Atom, Adapter} from '../interfaces/atom'
import promiseToObservable from '../utils/promiseToObservable'

import {
    atom,
    isAtom,
    struct,
    transact,
    Reactor
} from 'derivable'

export default ({
    atom,
    isAtom,
    transact,
    struct
}: Adapter)
