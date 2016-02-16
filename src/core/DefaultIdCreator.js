/* @flow */

import type {IdCreator} from 'reactive-di/i/annotationInterfaces' // eslint-disable-line

// implements IdCreator
export default class DefaultIdCreator {
    _lastId: number;
    _salt: string;

    constructor() {
        this._salt = Math.random().toString(36).substr(2, 6);
        this._lastId = 0
    }

    createId(): string {
        return this._salt + '.' + (++this._lastId)
    }
}
