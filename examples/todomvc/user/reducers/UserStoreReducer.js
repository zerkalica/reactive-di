/* @flow */
import UserStore from '../models/UserStore'

import {
    LoadUserComplete,
    LoadUserProgress,
    LoadUserError,

    RemoveUserComplete,
    RemoveUserProgress,
    RemoveUserError
} from '../actions/userActions'

const UserStoreReducer = {
    reduce(state: UserStore, action: Object): UserStore {
        // babelPatternMatch(action)
        return state
    },

    progress(state: UserStore, {user}: LoadUserProgress): UserStore {
        return state.copy({
            items: state.items.add(user)
        })
    },

    complete(state: UserStore, {user}: LoadUserComplete): UserStore {
        return state.copy({
            items: state.items.set(user.id, () => user.copy({}))
        })
    },

    error(state: UserStore, {userId, error}: LoadUserError): UserStore {
        return state.copy({
            items: state.items.set(userId, user => user.copy({$meta: {error}}))
        })
    },

    removeProgress(state: UserStore, {userId}: RemoveUserProgress): UserStore {
        return state.copy({
            items: state.items.set(userId, user => user.copy({$meta: {deleted: true}}))
        })
    },

    removeComplete(state: UserStore, {userId}: RemoveUserComplete): UserStore {
        return state.copy({
            items: state.items.remove(userId)
        })
    },

    removeError(state: UserStore, {userId, error}: RemoveUserError): UserStore {
        return state.copy({
            items: state.items.set(userId, user => user.copy({$meta: {deleted: false, error}}))
        })
    }
}

export default UserStoreReducer.reduce
