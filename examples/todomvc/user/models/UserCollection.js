/* @flow */

import User from './User'
import {Collection} from 'reactive-di'
import type {UserRec} from './User'

export default class UserCollection extends Collection<User> {
    createItem(rec: UserRec): User {
        return new User(rec)
    }
}
