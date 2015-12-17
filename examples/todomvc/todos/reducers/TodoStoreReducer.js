/* @flow */
import TodoStore from '../models/TodoStore'

import {
    AddTodoComplete,
    AddTodoProgress,
    AddTodoError,

    LoadTodosComplete,
    LoadTodosProgress,
    LoadTodosError,

    RemoveTodoComplete,
    RemoveTodoProgress,
    RemoveTodoError
} from '../actions/todosActions'

import {
    LoadTodoDescriptionComplete,
    LoadTodoDescriptionError,
    LoadTodoDescriptionProgress
} from '../actions/todoDescriptionActions'

const TodoStoreReducer = {
    reduce(state: TodoStore, action: Object): TodoStore {
        // babelPatternMatch(action)
        return state
    },

    loadDescription(
        state: TodoStore,
        {error, todoId, descr, loading}: LoadTodoDescriptionError | LoadTodoDescriptionComplete
    ): TodoStore {
        return state.copy({
            descriptions: state.descriptions.set(todoId, descr => descr.copy({$meta: {error, loading: !error}}))
        })
    },

    loadDescriptionProgress(state: TodoStore, {descr}: LoadTodoDescriptionProgress): TodoStore {
        return state.copy({
            descriptions: state.descriptions.add(descr.copy({$meta: {loading: true}}))
        })
    },

    addProgress(state: TodoStore, {todo}: AddTodoProgress): TodoStore {
        return state.copy({
            items: state.items.add(todo.copy({$meta: {loading: true, invalid: false}}))
        })
    },

    addComplete(state: TodoStore, {todoId}: AddTodoComplete): TodoStore {
        return state.copy({
            items: state.items.set(todoId, todo => todo.copy({$meta: {loading: false}}))
        })
    },

    addError(state: TodoStore, {error, todoId}: AddTodoError): TodoStore {
        return state.copy({
            items: state.items.set(todoId, todo => todo.copy({$meta: {error}}))
        })
    },

    loadProgress(state: TodoStore, {userId}: LoadTodosProgress): TodoStore {
        return state.copy({
            items: state.items.copy({$meta: {loading: true}})
        })
    },

    loadComplete(state: TodoStore, {todos, userId}: LoadTodosComplete): TodoStore {
        return state.copy({
            items: state.items.copy({items: todos})
        })
    },

    loadError(state: TodoStore, {error, userId}: LoadTodosError): TodoStore {
        return state.copy({
            items: state.items.copy({$meta: {error}})
        })
    },

    removeProgress(state: TodoStore, {todoId}: RemoveTodoProgress): TodoStore {
        return state.copy({
            items: state.items.set(todoId, todo => todo.copy({$meta: {deleted: true}}))
        })
    },

    removeComplete(state: TodoStore, {todoId}: RemoveTodoComplete): TodoStore {
        return state.copy({
            items: state.items.remove(todoId)
        })
    },

    removeError(state: TodoStore, {todoId, error}: RemoveTodoError): TodoStore {
        return state.copy({
            items: state.items.set(todoId, todo => todo.copy({$meta: {error}}))
        })
    }
}

export default TodoStoreReducer.reduce
