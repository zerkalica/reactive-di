// @flow

import {setterKey} from '../atoms/interfaces'

export type SetterResult<V: Object> = {
    (v: $Shape<$Subtype<V>>): void;
    [id: $Keys<V>]: (v: mixed) => void;
}

export class BaseModel {
    copy(rec: any): this {
        return Object.assign((Object.create(this.constructor.prototype): any), this, rec)
    }

    set(rec: any): this {
        const val = this.copy(rec)
        ;(val: any)[setterKey].set(this)
        return val
    }

    reset(): this {
        const val = new this.constructor()
        ;(val: any)[setterKey].set(this)
        return val
    }
}
