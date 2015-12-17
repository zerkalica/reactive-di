/* @flow */
import Todo from '../models/Todo'
import {Action, ErrorAction, ProgressAction} from '../../common/actions'

export class AddTodoProgress extends ProgressAction {
    todo: Todo;
    constructor(todo: Todo) {
        super()
        this.todo = todo
    }
}
export class AddTodoComplete extends Action {
    todoId: ?string;
    constructor(todoId: ?string) {
        super()
        this.todoId = todoId
    }
}

export class AddTodoError extends ErrorAction {
    todoId: ?string;
    constructor(error: Error, todoId: ?string) {
        super(error)
        this.todoId = todoId
    }
}

export class LoadTodosProgress extends ProgressAction {
    userId: string;
    constructor(userId: string) {
        super()
        this.userId = userId
    }
}
export class LoadTodosComplete extends Action {
    todos: Array<Todo>;
    userId: string;
    constructor(todos: Array<Todo>, userId: string) {
        super()
        this.todos = todos
        this.userId = userId
    }
}
export class LoadTodosError extends ErrorAction {
    userId: string;
    constructor(error: Error, userId: string) {
        super(error)
        this.userId = userId
    }
}

export class RemoveTodoProgress extends ProgressAction {
    todoId: string;
    constructor(todoId: string) {
        super()
        this.todoId = todoId
    }
}
export class RemoveTodoComplete extends Action {
    todoId: string;
    constructor(todoId: string) {
        super()
        this.todoId = todoId
    }
}
export class RemoveTodoError extends ErrorAction {
    todoId: string;
    constructor(error: Error, todoId: string) {
        super(error)
        this.todoId = todoId
    }
}
