// @flow
import type {Atom, Adapter} from '../interfaces'

import {
    atom,
    isAtom,
    struct,
    transact,
    Reactor
} from 'derivable'

function noop() {}

export function promiseToObservable<V, E>(
    promise: Promise<V>
): Observable<V, E> {
    if (typeof promise.then !== 'function') {
        throw new TypeError('promise argument is not a Promise')
    }

    function promiseToObservableSubscriber(observer: SubscriptionObserver<V, E>): () => void {
        let isSubscribed: boolean = true

        function promiseToObservableUnsubscribe(): void {
            // todo: memory leak
            isSubscribed = false
            if (typeof promise.cancel === 'function') {
                promise.cancel()
            }
        }
        function success(data: V): void {
            if (isSubscribed) {
                observer.complete(data)
            }
        }
        function error(e: E): void {
            if (isSubscribed) {
                observer.error(e)
            }
        }
        promise.then(success).catch(error)

        return promiseToObservableUnsubscribe
    }

    return new Observable(promiseToObservableSubscriber)
}

class AtomObserver<V> {
    _setValue: (val: V) => void;
    _stop: () => void;

    constructor(
        setValue: (val: V) => void,
        stop: () => void
    ) {
        this._setValue = setValue
        this._stop = stop
    }

    next(v: V): void {
        this._setValue(v)
    }

    complete(v?: ?V): void {
        if (v) {
            this._setValue(v)
        }
        this._stop()
    }

    error(err: Error): void {
        // @todo: handle errors in derivable
        throw err
    }
}

function atomFromObservable<V>(
    v: V,
    raw: Promise<V> | Observable<V, Error>
): Atom<V> {
    const va: Atom<V> = atom(v)
    if (raw) {
        const observable: Observable<V, Error> = typeof (raw: any).then === 'function'
            ? promiseToObservable(((raw: any): Promise<V>))
            : ((raw: any): Observable<V, Error>)

        const setValue = (val: V) => {
            va.set(val)
        }
        const stop = () => {}
        const sub = observable.subscribe(new AtomObserver(setValue, stop))
    }

    return va
}

export default ({
    atom,
    isAtom,
    atomFromObservable,
    struct
}: Adapter)
