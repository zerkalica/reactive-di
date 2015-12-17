/* @flow */
import EntityMeta from '../../common/EntityMeta'
import Todo from '../models/Todo'
import TodoStateLoader from '../loaders/TodoStateLoader'
import User from '../../user/models/User'
import UserStateLoader from '../../user/loaders/UserStateLoader'
import UserIdQueryArg from './UserIdQueryArg'

export default class UserTodosModel {
    user: User;
    todos: Array<Todo>;
    $meta: EntityMeta;

    constructor(
        todoStateLoader: TodoStateLoader,
        userStateLoader: UserStateLoader,
        userIdQueryArg: UserIdQueryArg
    ) {
        const todos = todoStateLoader.getAllByUserId(userIdQueryArg.userId)
        this.user = userStateLoader.getById(userIdQueryArg.userId)
        this.todos = todos.toArray() // remove soft deleted from collection
        this.$meta = EntityMeta.fromArray([todos, userIdQueryArg])
    }
}
