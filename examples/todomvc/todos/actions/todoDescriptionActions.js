/* @flow */
import TodoDescription from '../models/TodoDescription'
import type {TodoDescriptionRec} from '../models/TodoDescription'
import {Action, ErrorAction, ProgressAction} from '../../common/actions'

export class LoadTodoDescriptionComplete extends Action {
    todoId: ?string;
    descr: TodoDescription;
    error: ?Error;
    loading: ?boolean;
    constructor(descr: TodoDescription) {
        super()
        this.descr = descr
    }
}

export class LoadTodoDescriptionError extends ErrorAction {
    todoId: ?string;
    descr: ?TodoDescription;
    loading: ?boolean;
    constructor(error: Error, todoId: ?string) {
        super(error)
        this.todoId = todoId
    }
}

export class LoadTodoDescriptionProgress extends ProgressAction {
    todoId: ?string;
    descr: TodoDescription;
    error: ?Error;
    loading: ?boolean;
    constructor(descr: TodoDescription) {
        super()
        this.loading = true
        this.descr = descr
    }
}
