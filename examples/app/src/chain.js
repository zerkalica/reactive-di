// @flow
/* eslint-env browser */

import {render, createVNode as infernoCreateVNode} from 'inferno'
import Component from 'inferno-component'
import {createReactRdiAdapter, DiFactory, SourceStatus} from 'reactive-di/index'
import {actions, hooks, src} from 'reactive-di/annotations'
import Fetcher from './common/Fetcher'

class User {
    id = ''
    name = ''
}
@hooks(User)
class UserHooks {
    _fetcher: Fetcher

    constructor(fetcher: Fetcher) {
        this._fetcher = fetcher
    }

    pull(user: User) {
        const fetcher = this._fetcher
        src(user).update({
            run(): Promise<User> {
                return fetcher.fetch('/user')
            }
        })
    }
}

interface ITodo {
    id: string;
    title: string;
    uid: string;
}

class Todos extends Array<ITodo> {}

@hooks(Todos)
class TodosHooks {
    _fetcher: Fetcher
    _user: User

    constructor(fetcher: Fetcher, user: User) {
        this._fetcher = fetcher
        this._user = user
    }

    pull(todos: Todos) {
        const fetcher = this._fetcher
        const user = this._user
        if (!user.id) {
            src(todos).pend(true)
            return
        }
        src(todos).update({
            run(): Promise<User> {
                return fetcher.fetch('/todos', {
                    body: {uid: user.id}
                })
            }
        })
    }
}

class SelectedTodo implements ITodo {
    id = ''
    title = ''
    uid = ''
}

@hooks(SelectedTodo)
class SelectedTodoHooks {
    _todos: Todos

    constructor(todos: Todos) {
        this._todos = todos
    }

    pull(todo: ITodo) {
        const todos = this._todos
        if (todos.length && !todo.id) {
            src(todo).set(todos[0])
        }
    }
}

@actions
class SelectedTodosService {
    _ts: SelectedTodo

    constructor(ts: SelectedTodo) {
        this._ts = ts
    }

    some() {}
}

class TodoLoadingStatus extends SourceStatus {
    static statuses = [SelectedTodosService]
}

function SelectedTodoView(
    _: {},
    {
        selectedTodo,
        status
    }: {
        selectedTodo: SelectedTodo;
        status: TodoLoadingStatus;
    }
) {
    return <div>
        <h1>Chain loads</h1>
        {JSON.stringify(selectedTodo)}
        <div>
            {status.pending ? 'loading...' : 'complete'}
            {status.error ? status.error.message : null}
        </div>
    </div>
}

// used in jsx below, jsx pragma t
const _t = new DiFactory({ // eslint-disable-line
    values: {
        Fetcher: new Fetcher({
            '/todos': (params: Object) => {
                return [
                    {
                        uid: '123',
                        id: '1',
                        titile: 'todo 1'
                    },
                    {
                        uid: '123',
                        id: '2',
                        titile: 'todo 2'
                    }
                ].filter((todo: Object) => todo.uid === params.body.uid)
            },
            '/user': (_params: Object) => {
                return {
                    id: '123',
                    name: 'John Doe'
                }
            }
        })
    },
    createVNode: infernoCreateVNode,
    createComponent: createReactRdiAdapter(Component)
})
    .create()

render(
    <SelectedTodoView />,
    window.document.getElementById('app')
)
