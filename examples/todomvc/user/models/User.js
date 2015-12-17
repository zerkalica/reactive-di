/* @flow */

import EntityMeta, {create, copyProps} from '../../common/EntityMeta'
import type {EntityMetaRec} from '../../common/EntityMeta'

export type UserRec = {
    id?: ?string;
    name?: ?string;
    $meta?: EntityMetaRec
}

export default class User {
    id: ?string;
    name: ?string;
    $meta: EntityMeta;

    constructor(rec: UserRec = {}) {
        this.id = rec.id || null
        this.name = rec.name || null
        this.$meta = create(rec.$meta, EntityMeta)
    }

    copy(rec: UserRec = {}): User {
        return new User(copyProps(this, rec))
    }
}
