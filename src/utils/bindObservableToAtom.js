// @flow

import type {Atom} from 'reactive-di/interfaces/atom'

export default function bindObservableToAtom<V>(value: V, atom: Atom<V>): () => void {
    atom.set(value)
    const subscription: Subscription = Observable.from(value).subscribe({
        next(value: V) {
            atom.set(value)
        },
        complete() {},
        error() {}
    })

    return () => subscription.unsubscribe()
}
