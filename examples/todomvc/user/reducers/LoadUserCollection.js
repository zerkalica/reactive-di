/* @flow */

import {setter} from 'reactive-di/annotations'
import type {EntityMetaRec} from 'reactive-di'
import {Promised} from 'reactive-di'
import UserCollection 'app/users/model/UserCollection'

function LoadUserCollection(users: Promised<UserCollection>) {
    return function loadUserCollection<T>(
        rec: EntityMetaRec,
        rawUsers?: Array<T>
    ): Promised<UserCollection> {
        return users.copy({
            ...rec,
            value: rawUsers ? new UserCollection(rawUsers) : users.value
        })
    }
}
export default setter(UserCollection)(LoadUserCollection)
