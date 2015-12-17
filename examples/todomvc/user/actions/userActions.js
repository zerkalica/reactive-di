/* @flow */
import User from '../models/User'
import {Action, ErrorAction, ProgressAction} from '../../common/actions'

export class LoadUserComplete extends Action {
    user: User;
    constructor(user: User) {
        super()
        this.user = user
    }
}

export class LoadUserError extends ErrorAction {
    userId: ?string;
    constructor(error: Error, userId: ?string) {
        super(error)
        this.userId = userId
    }
}

export class LoadUserProgress extends ProgressAction {
    user: User;
    constructor(user: User) {
        super()
        this.user = user
    }
}

export class RemoveUserProgress extends ProgressAction {
    userId: string;
    constructor(userId: string) {
        super()
        this.userId = userId
    }
}
export class RemoveUserComplete extends Action {
    userId: string;
    constructor(userId: string) {
        super()
        this.userId = userId
    }
}

export class RemoveUserError extends ErrorAction {
    userId: string;
    constructor(error: Error, userId: string) {
        super(error)
        this.userId = userId
    }
}
