/* @flow */
import {Dispatcher} from '../../common/helpers'
import User from '../models/User'
import UserCollection from '../models/UserCollection'
import UserFetcher from '../fetchers/UserFetcher'

import {
    LoadUserComplete,
    LoadUserProgress,
    LoadUserError,

    RemoveUserComplete,
    RemoveUserProgress,
    RemoveUserError
} from '../actions/userActions'

export default class UserStateLoader {
    fetcher: UserFetcher;
    dispatcher: Dispatcher;
    items: UserCollection;

    constructor(
        fetcher: UserFetcher,
        dispatcher: Dispatcher,
        items: UserCollection
    ) {
        this.fetcher = fetcher
        this.dispatcher = dispatcher
        this.items = items
    }

    _createEmpty(userId: ?string): User {
        return new User({id: userId || undefined, $meta: {loading: true}})
    }

    getById(userId: ?string): User {
        const {items, fetcher, dispatcher} = this
        let user = items.find(user => user.id === userId)
        if (!user) {
            user = this._createEmpty(userId)
            if (userId) {
                dispatcher.dispatch(new LoadUserProgress(user))
                fetcher.load(userId)
                    .then(usr => dispatcher.dispatch(new LoadUserComplete(usr)))
                    .catch(error => dispatcher.dispatch(new LoadUserError(error, userId)))
            }
        }

        return user
    }

    remove(userId: string): void {
        const {items, fetcher, dispatcher} = this
        dispatcher.dispatch(new RemoveUserProgress(userId))
        fetcher.load(userId)
            .then(() => dispatcher.dispatch(new RemoveUserComplete(userId)))
            .catch(error => dispatcher.dispatch(new RemoveUserError(error, userId)))
    }
}
