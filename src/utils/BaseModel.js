// @flow

import {setterKey} from '../atoms/interfaces'

export type SetterResult<V: Object> = {
    (v: $Shape<$Subtype<V>>): void;
    [id: $Keys<V>]: (v: mixed) => void;
}

export default class BaseModel {
    copy(rec: Object): this {
        return Object.assign((Object.create(this.constructor.prototype): any), this, rec)
    }

    set(rec: Object): this {
        const val = this.copy(rec)
        ;(this: any)[setterKey].set(val)
        return val
    }

    commit(): this {
        (this: any)[setterKey].set(this)

        return this
    }

    reset(): this {
        const val = new this.constructor()
        ;(this: any)[setterKey].set(val)
        return val
    }
}
