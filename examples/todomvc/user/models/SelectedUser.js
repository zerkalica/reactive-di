/* @flow */

import EntityMeta, {create, copyProps} from '../../common/EntityMeta'
import type {EntityMetaRec} from '../../common/EntityMeta'

export type SelectedUserRec = {
    id?: string;
    $meta?: EntityMetaRec
}

export default class SelectedUser {
    id: ?string;
    $meta: EntityMeta;

    constructor(rec: SelectedUserRec = {}) {
        this.id = rec.id
        this.$meta = create(rec.$meta, EntityMeta)
    }

    copy(rec: SelectedUserRec): SelectedUser {
        return new SelectedUser(copyProps(this, rec))
    }
}
