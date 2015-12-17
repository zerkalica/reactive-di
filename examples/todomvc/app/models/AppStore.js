/* @flow */

import TodoStore from '../../todos/models/TodoStore'
import UserStore from '../../user/models/UserStore'
import EntityMeta, {create} from '../../common/EntityMeta'
import type {TodoStoreRec} from '../../todos/models/TodoStore'
import type {UserStoreRec} from '../../user/models/UserStore'

type AppStoreRec = {
    todoStore?: TodoStore;
    userStore?: UserStore;
}

export default class AppStore {
    todoStore: TodoStore;
    userStore: UserStore;
    $meta: EntityMeta;

    constructor(rec: AppStoreRec = {}) {
        this.todoStore = create(rec.todoStore, TodoStore)
        this.userStore = create(rec.userStore, UserStore)
        this.$meta = EntityMeta.fromArray([this.todoStore, this.userStore])
    }

    copy(rec: AppStoreRec = {}): AppStore {
        return new AppStore({...this, ...rec})
    }
}
