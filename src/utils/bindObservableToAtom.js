// @flow

import type {Atom} from 'reactive-di/interfaces/atom'

export default function bindObservableToAtom<V>(value: V, atom: Atom<V>): () => void {
    atom.set(value)
    const subscription: Subscription = Observable.from(value).subscribe({
        next(v: V) {
            atom.set(v)
        },
        complete() {},
        error() {}
    })

    return () => subscription.unsubscribe()
}
