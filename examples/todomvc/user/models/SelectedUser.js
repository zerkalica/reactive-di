/* @flow */

import EntityMeta, {create, copyProps} from 'reactive-di/EntityMeta'

export type SelectedUserRec = {
    id?: string;
    $meta?: EntityMeta
}

export default class SelectedUser {
    id: ?string;
    $meta: EntityMeta;

    constructor(rec: SelectedUserRec = {}) {
        this.id = rec.id
        this.$meta = create(rec.$meta, EntityMeta)
    }

    copy(rec: SelectedUserRec): SelectedUser {
        return copyProps(this, rec, SelectedUser)
    }
}
