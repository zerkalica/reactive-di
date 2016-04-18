/* @flow */

type Disposable = {
    isDisposed: boolean;
}

export default class Collection<T: Disposable> {
    _items: Array<T> = new Array(100);
    length: number = 0;

    add(item: T): void {
        const l = this.length
        this._items[l] = item
        this.length = l + 1
    }

    forEach(fn: (item: T) => void) {
        const items = this._items
        const l = this.length
        const newItems: Array<T> = new Array(100);
        let j = 0
        for (let i = 0; i < l; i = i + 1) {
            const item: T = items[i];
            if (!item.isDisposed) {
                fn(item)
                newItems[j] = item
                j = j + 1
            }
        }

        if (j < l) {
            this.length = j
            this._items = newItems
        }
    }
}
