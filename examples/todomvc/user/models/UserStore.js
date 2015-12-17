/* @flow */

import Collection from '../../common/Collection'
import SelectedUser from './SelectedUser'
import User from './User'
import UserCollection from './UserCollection'
import EntityMeta, {create, copyProps} from '../../common/EntityMeta'
import type {EntityMetaRec} from '../../common/EntityMeta'
import type {SelectedUserRec} from './SelectedUser'

export type UserStoreRec = {
    items?: Collection<User>;
    selectedUser?: SelectedUserRec;
}

export default class UserStore {
    items: Collection<User>;
    $meta: EntityMeta;
    selectedUser: SelectedUser;

    constructor(rec: UserStoreRec = {}) {
        this.items = create(rec.items, UserCollection)
        this.selectedUser = create(rec.selectedUser, SelectedUser)
        this.$meta = EntityMeta.fromArray([this.items, this.selectedUser])
    }

    copy(rec: UserStoreRec): UserStore {
        return new UserStore(copyProps(this, rec))
    }
}
