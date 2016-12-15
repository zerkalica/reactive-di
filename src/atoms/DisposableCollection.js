// @flow

import type {IDisposable} from './interfaces'

export default class DisposableCollection<V: IDisposable> {
    items: V[] = []

    push(v: V) {
        this.items.push(v)
        if (!(this.items.length % 5)) {
            this.gc()
        }
    }

    gc(): void {
        const items = this.items
        const newItems = []
        for (let i = 0, l = items.length; i < l; i++) {
            const item = items[i]
            if (!item.closed) {
                newItems.push(item)
            }
        }
        this.items = newItems
    }
}
