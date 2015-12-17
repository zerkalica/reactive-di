/* @flow */
import {Fetcher, DataLoader} from '../../common/helpers'
import TodoDescription from '../models/TodoDescription'

export default class TodoDescriptionFetcher extends DataLoader<string, TodoDescription> {
    fetcher: Fetcher;
    constructor(fetcher: Fetcher) {
        super()
        this.fetcher = fetcher
    }

    _batch(keys: Array<string>): Promise<Array<TodoDescription>> {
        const {fetcher} = this
        return Promise.all(keys.map(todoId => fetcher.fetch(`/todos/${todoId}/description`)))
    }
}
