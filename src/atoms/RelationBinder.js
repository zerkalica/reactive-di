// @flow
import type {
    IParent,
    IRelationItem
} from './interfaces'

import debugName from '../utils/debugName'

function mapNames(rec: IRelationItem): string {
    return rec.v.displayName
}

export default class RelationBinder<Element> {
    stack: IRelationItem[] = []
    level: number = 0

    _levels: number[] = []

    debugStr(sub: ?mixed): string {
        const name = debugName(sub)
        const names = this.stack.map(mapNames)
        if (names[names.length - 1] !== name) {
            names.push(name)
        }

        return names.join('.')
    }

    begin(depItem: IParent<*, Element>, isEnder?: boolean): void {
        if (isEnder) {
            this.level = this.stack.length
            this._levels.push(this.level)
        }
        this.stack.push({has: [], v: depItem, ender: isEnder || false})
    }

    end(): void {
        if (this.stack.pop().ender) {
            this.level = this._levels.pop()
            if (this._levels.length === 0) {
                this.level = 0
            }
        }
    }
}
