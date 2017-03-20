// @flow

import type {IComputed, IConsumer, IRelationItemValue, IRelationBinder, IRelationItem} from './source/interfaces'
import debugName from './utils/debugName'

function mapNames(rec: IRelationItem): string {
    return rec.v.displayName
}

export default class RelationBinder implements IRelationBinder {
    level: number = 0
    stack: IRelationItem[] = []
    status: ?IComputed<any> = null
    consumer: ?IConsumer = null
    _prevConsumer: ?IConsumer = null
    _levels: number[] = []

    debugStr(sub: ?mixed): string {
        const name = debugName(sub)
        const names = this.stack.map(mapNames)
        if (names[names.length - 1] !== name) {
            names.push(name)
        }

        return names.join('.')
    }

    begin(v: IRelationItemValue, isEnder: boolean): void {
        if (isEnder) {
            this._prevConsumer = this.consumer
            this.consumer = null
            this._levels.push(this.level)
            this.level = this.stack.length
        }
        this.stack.push({has: [], v, ender: isEnder || false})
    }

    end(): void {
        if (this.stack.pop().ender) {
            this.level = this._levels.pop()
            if (this._levels.length === 0) {
                this.consumer = this._prevConsumer
                this.level = 0
            }
        }
    }
}
