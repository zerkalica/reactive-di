/* @flow */
import {Fetcher, DataLoader} from '../../common/helpers'
import Todo from '../models/Todo'

export default class TodoFetcher extends DataLoader<string, Todo> {
    fetcher: Fetcher;
    constructor(fetcher: Fetcher) {
        super()
        this.fetcher = fetcher
    }

    loadMultiple(): Promise<Array<Todo>> {
        return Promise.resolve([])
    }

    _batch(keys: Array<string>): Promise<Array<Todo>> {
        const {fetcher} = this
        return Promise.all(keys.map(todoId => fetcher.fetch(`/todos/${todoId}`)))
    }
}
