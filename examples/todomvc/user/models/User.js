/* @flow */

import {EntityMeta, copyProps} from 'reactive-di'

export type UserRec = {
    id?: ?string;
    name?: ?string;
    $meta?: EntityMeta
}

export default class User {
    id: ?string;
    name: ?string;
    $meta: EntityMeta;

    constructor(rec: UserRec = {}) {
        this.id = rec.id || null
        this.name = rec.name || null
        this.$meta = rec.$meta || new EntityMeta()
    }

    copy(rec: UserRec = {}): User {
        return copyProps(this, rec, User)
    }
}
