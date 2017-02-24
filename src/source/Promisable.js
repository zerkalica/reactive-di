// @flow

export default class Promisable<V> {
    _resolve: (v: V) => void
    _reject: (e: Error) => void
    promise: Promise<V>

    constructor() {
        this._createPromise()
    }

    _createPromise() {
        this.promise = new Promise((resolve: (v: V) => void, reject: (e: Error) => void) => {
            this._resolve = resolve
            this._reject = reject
        })
    }

    resolve(v: V) {
        this._resolve(v)
        this._createPromise()
    }

    reject(e: Error) {
        this._reject(e)
        this._createPromise()
    }
}
