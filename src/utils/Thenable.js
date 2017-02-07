// @flow

export default class Thenable<T> {
    _cbs: ((t: T) => any)[] = []

    then(cb: (t: T) => any): this {
        this._cbs.push(cb)
        return this
    }

    set: (t: T) => Thenable<T> = (t: T) => this._set(t)

    _set(t: T): this {
        const cbs = this._cbs
        this._cbs = []
        for (let i = 0; i < cbs.length; i++) {
            cbs[i](t)
        }

        return this
    }
}
