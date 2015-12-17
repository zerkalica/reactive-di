/* @flow */
import TodoDescriptionFetcher from '../fetchers/TodoDescriptionFetcher'
import {Dispatcher} from '../../common/helpers'
import TodoDescription from '../models/TodoDescription'
import TodoDescriptionCollection from '../models/TodoDescriptionCollection'
import EntityMeta from '../../common/EntityMeta'

import {
    LoadTodoDescriptionComplete,
    LoadTodoDescriptionError,
    LoadTodoDescriptionProgress
} from '../actions/todoDescriptionActions'

export default class TodoDescriptionStateLoader {
    fetcher: TodoDescriptionFetcher;
    dispatcher: Dispatcher;
    descriptions: TodoDescriptionCollection;

    constructor(
        descriptions: TodoDescriptionCollection,
        fetcher: TodoDescriptionFetcher,
        dispatcher: Dispatcher
    ) {
        this.fetcher = fetcher
        this.dispatcher = dispatcher
        this.descriptions = descriptions
    }

    _createEmpty(todoId: ?string): TodoDescription {
        return new TodoDescription({
            todoId: todoId || undefined,
            $meta: {loading: true}
        })
    }

    getById(todoId: ?string): TodoDescription {
        const {descriptions, fetcher, dispatcher} = this
        let descr = todoId ? descriptions.get(todoId) : null
        if (!descr) {
            descr = this._createEmpty(todoId)
            if (todoId) {
                dispatcher.dispatch(new LoadTodoDescriptionProgress(descr))
                fetcher.load(todoId)
                    .then(d => dispatcher.dispatch(new LoadTodoDescriptionComplete(d)))
                    .catch(error => dispatcher.dispatch(new LoadTodoDescriptionError(error, todoId)))
            }
        }

        return descr
    }
}
