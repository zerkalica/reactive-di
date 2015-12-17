/* @flow */

import User from '../models/User'
import {Fetcher, DataLoader} from '../../common/helpers'

export default class UserFetcher extends DataLoader<string, User> {
    fetcher: Fetcher;
    constructor(fetcher: Fetcher) {
        super()
        this.fetcher = fetcher
    }

    _batch(keys: Array<string>): Promise<Array<User>> {
        const {fetcher} = this
        return Promise.all(keys.map(userId => fetcher.fetch(`/users/${userId}`)))
    }
}
