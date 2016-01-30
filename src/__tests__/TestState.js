/* @flow */

import annotations from './annotations'
import merge from '../utils/merge'
import BaseCollection from '../utils/BaseCollection'
const {model} = annotations

type UserRec = {
    id?: string,
    name?: string
};

class User {
    id: string;
    name: string;

    constructor(rec: UserRec = {}) {
        this.id = rec.id || ''
        this.name = rec.name || ''
    }

    copy(rec: UserRec): User {
        return merge(this, rec)
    }
}

export class CurrentUser extends User {
}
model(CurrentUser)

type UserStoreRec = {
    currentUser?: CurrentUser
};

export class UserStore {
    currentUser: CurrentUser;

    constructor(rec: UserStoreRec = {}) {
        this.currentUser = rec.currentUser || new CurrentUser()
    }

    copy(rec: UserStoreRec): UserStore {
        return merge(this, rec)
    }
}
model(UserStore)

type AppStateRec = {
    userStore?: UserStore
};

export class AppState {
    userStore: UserStore;

    constructor(rec: AppStateRec = {}) {
        this.userStore = rec.userStore || new UserStore()
    }

    copy(rec: AppStateRec): AppState {
        return merge(this, rec)
    }
}
model(AppState)
