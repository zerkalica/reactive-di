/* @flow */

import EntityMeta from '../../common/EntityMeta'
import SelectedTodo from '../models/SelectedTodo'
import Todo from '../models/Todo'
import TodoDescription from '../models/TodoDescription'
import TodoDescriptionStateLoader from '../loaders/TodoDescriptionStateLoader'
import TodoStateLoader from '../loaders/TodoStateLoader'
import User from '../../user/models/User'
import UserStateLoader from '../../user/loaders/UserStateLoader'

export default class SelectedTodoModel {
    id: ?string;
    title: ?string;
    description: ?string;
    user: User;
    $meta: EntityMeta;

    constructor(
        selectedTodo: SelectedTodo,
        todoDescriptionStateLoader: TodoDescriptionStateLoader,
        userStateLoader: UserStateLoader,
        todoStateLoader: TodoStateLoader
    ) {
        const todo = todoStateLoader.getById(selectedTodo.id)
        const description = todoDescriptionStateLoader.getById(selectedTodo.id)
        const user = userStateLoader.getById(todo.userId)

        this.id = todo.id
        this.title = todo.title
        this.description = description.text
        this.user = user

        this.$meta = EntityMeta.fromArray([description, user, todo])
    }
}
