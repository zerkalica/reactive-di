/* @flow */

import type {
    Disposable,
    Collection // eslint-disable-line
} from 'reactive-di/i/coreInterfaces'

// implements Collection
export default class DisposableCollection<T: Disposable> {
    items: Array<T>;
    _count: number;
    _swap: Array<T>;

    constructor(items: Array<T> = []) {
        this.items = items
        this._count = 0
        this._swap = new Array(100)
    }

    add(item: T): void {
        let items = this.items
        let l = items.length
        this._count = this._count + 1
        if (this._count > 10) {
            this._count = 0
            const swap = this._swap
            let j = 0
            for (let i = 0; i < l; i = i + 1) {
                const oldItem: T = items[i];
                if (!oldItem.isDisposed) {
                    swap[j] = item
                    j = j + 1
                }
            }
            if (j < l) {
                swap.length = j
                items = this.items = swap
                this._swap = new Array(100)
                l = j
            }
        }

        items[l] = item
    }
}
