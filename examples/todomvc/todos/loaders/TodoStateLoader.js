/* @flow */

import TodoFetcher from '../fetchers/TodoFetcher'
import {Dispatcher} from '../../common/helpers'
import TodoCollection from '../models/TodoCollection'
import Todo from '../models/Todo'
import EntityMeta from '../../common/EntityMeta'

import {
    LoadTodosComplete,
    LoadTodosProgress,
    LoadTodosError,

    AddTodoComplete,
    AddTodoError,
    AddTodoProgress,

    RemoveTodoComplete,
    RemoveTodoError,
    RemoveTodoProgress
} from '../actions/todosActions'

export default class TodoStateLoader {
    fetcher: TodoFetcher;
    dispatcher: Dispatcher;
    items: TodoCollection;

    constructor(
        items: TodoCollection,
        fetcher: TodoFetcher,
        dispatcher: Dispatcher
    ) {
        this.fetcher = fetcher
        this.dispatcher = dispatcher
        this.items = items
    }

    _createEmpty(todoId: ?string): Todo {
        return new Todo({
            id: todoId || undefined,
            $meta: {loading: true}
        })
    }

    getAllByUserId(userId: string): TodoCollection {
        const {items, fetcher, dispatcher} = this

        if (!userId) {
            return items
        }

        const meta = items.$meta
        if ((meta.invalid && !meta.loading) || items.userId !== userId) {
            dispatcher.dispatch(new LoadTodosProgress(userId))
            fetcher.loadMultiple(userId)
                .then(todos => dispatcher.dispatch(new LoadTodosComplete(todos, userId)))
                .catch(err => dispatcher.dispatch(new LoadTodosError(err, userId)))
        }
        return items
    }

    getById(todoId: ?string): Todo {
        const {items, fetcher, dispatcher} = this
        let todo = items.find(todo => todo.id === todoId)
        if (!todo) {
            todo = this._createEmpty(todoId)
            if (todoId) {
                dispatcher.dispatch(new AddTodoProgress(todo))
                fetcher.load(todoId)
                    .then(todo => dispatcher.dispatch(new AddTodoComplete(todoId)))
                    .catch(err => dispatcher.dispatch(new AddTodoError(err, todoId)))
            }
        }

        return todo
    }

    remove(todoId: string): void {
        const {items, fetcher, dispatcher} = this
        dispatcher.dispatch(new RemoveTodoProgress(todoId))
        fetcher.load(todoId)
            .then(() => dispatcher.dispatch(new RemoveTodoComplete(todoId)))
            .catch(err => dispatcher.dispatch(new RemoveTodoError(err, todoId)))
    }
}
