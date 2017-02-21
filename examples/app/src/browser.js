// @flow
/* eslint-env browser */

// import {Component, createElement} from 'react'
// import {render} from 'react-dom'

import {render} from 'inferno'
import Component from 'inferno-component'
import createElement from 'inferno-create-element'

import {create as createJss} from 'jss'
import jssCamel from 'jss-camel-case'

import {
    getSrc,
    Thenable,
    SourceStatus,
    DiFactory,
    ReactComponentFactory,
    IndexCollection
} from 'reactive-di/index'
import type {ICallerInfo} from 'reactive-di/index'
import {actions, hooks, deps, theme, component, source} from 'reactive-di/annotations'

const todosFixture: any = []

// const maxTodos = 5000
const maxTodos = 5

for (let i = 0; i < maxTodos; i++) {
    todosFixture.push({
        id: i + 1,
        title: 'John Doe ' + i,
        email: 'john' + i + '@example.com'
    })
}

// Fetcher service, could be injected from outside by key 'Fetcher' as is
@source({key: 'Fetcher', instance: true})
class Fetcher {
    _count = 0
    fetch<V: Object>(_url: string, _params?: {method: string}): Promise<V> {
        // fake fetcher for example
        console.log(`fetch ${_url} ${JSON.stringify(_params)}`) // eslint-disable-line
        return new Promise((resolve: (v: V) => void, reject: (e: Error) => void) => {
            const isError = false
            setTimeout(() => {
                return isError
                    ? reject(new Error('Fake error'))
                    : resolve(todosFixture)
            }, 600)
        })
    }
}

let counter = maxTodos
@source({key: 'Todo'})
class Todo {
    id = ++counter
    title = ''
    email = ''
}

@source({key: 'Todos'})
class Todos extends IndexCollection {
    static Item = Todo
}

@deps(Fetcher)
@hooks(Todos)
class TodosHooks {
    _fetcher: Fetcher
    _abort: () => void

    constructor(fetcher: Fetcher) {
        this._fetcher = fetcher
    }

    willMount(todos: Todos): void {
        const fetcher = this._fetcher
        this._abort = getSrc(todos).update({
            promise(): Promise<Todos> {
                return fetcher.fetch('/todos', {method: 'GET'})
            }
        })
    }

    willUnmount(): void {
        this._abort()
    }
}

@source({key: 'AddedTodo'})
class AddedTodo extends Todo {
    title: string
}

// Model ThemeVars, could be injected from outside by key 'ThemeVars' as ThemeVarsRec
@source({key: 'ThemeVars'})
class ThemeVars {
    color = 'black'
}

class TodoRefs {
    title: Thenable<HTMLElement> = new Thenable()
}

@source({key: 'TodoServiceSubmitResult'})
class TodoServiceSubmitResult {}

@deps(
    Fetcher,
    Todos,
    TodoRefs,
    ThemeVars,
    TodoServiceSubmitResult,
    AddedTodo
)
@actions
class TodoService {
    _tv: ThemeVars
    _refs: TodoRefs
    _todoServiceSubmitResult: TodoServiceSubmitResult
    _addedTodo: AddedTodo
    _fetcher: Fetcher
    _todos: Todos

    constructor(
        fetcher: Fetcher,
        todos: Todos,
        refs: TodoRefs,
        tv: ThemeVars,
        todoServiceSubmitResult: TodoServiceSubmitResult,
        addedTodo: AddedTodo
    ) {
        this._fetcher = fetcher
        this._todos = todos
        this._tv = tv
        this._refs = refs
        this._addedTodo = addedTodo
        this._todoServiceSubmitResult = todoServiceSubmitResult
    }

    submit(): void {
        const fetcher = this._fetcher
        const addedTodo = this._addedTodo
        const todos = this._todos

        getSrc(this._todoServiceSubmitResult).update({
            promise(): Promise<TodoServiceSubmitResult> {
                return fetcher.fetch('/todo', {
                    method: 'POST',
                    body: JSON.stringify(addedTodo)
                })
            },
            complete(): void {
                todos.push(addedTodo)
                getSrc(addedTodo).reset()
            }
        })
    }

    changeColor(): void {
        getSrc(this._tv).merge({color: 'green'})
    }
}

@source({key: 'EditingTodo'})
class EditingTodo extends Todo {
    title: string
}

@deps(Todos, EditingTodo)
@actions
class TodoViewService {
    _todos: Todos
    _todo: Todo
    _editingTodo: EditingTodo

    constructor(todos: Todos, editingTodo: EditingTodo) {
        this._todos = todos
        this._editingTodo = editingTodo
    }

    setTodo(todo: Todo) {
        this._todo = todo
    }

    removeTodo(todo: Todo): void {
        this._todos.remove(this._todo || todo)
    }

    beginEdit(todo: Todo): void {
        getSrc(this._editingTodo).set(this._todo || todo)
    }

    submitEdit(): void {
        this._todos.update(this._editingTodo)
        getSrc(this._editingTodo).reset()
    }

    cancelEdit(): void {
        getSrc(this._editingTodo).reset()
    }
}

function TodoView(
    {item}: {
        item: Todo
    }, {editingTodo, service}: {
        editingTodo: EditingTodo,
        service: TodoViewService
    },
    _t: any
) {
    const isEdited = editingTodo.id === item.id

    if (isEdited) {
        return <div>
            <input
                name="editTodo"
                value={editingTodo.title}
                onInput={getSrc(editingTodo).eventSetter().title}
            />
            <button onClick={service.submitEdit}>Save</button>
            <button onClick={service.cancelEdit}>Cancel</button>
        </div>
    }

    return <div>
        <span>{item.id} - {item.title}</span>
        <button onClick={() => service.beginEdit(item)}>Edit</button>
        <button onClick={() => service.removeTodo(item)}>X</button>
    </div>
}
component({
    // register: [
    //     TodoViewService
    // ]
})(TodoView)
deps({
    editingTodo: EditingTodo,
    service: TodoViewService
})(TodoView)

// @hooks(TodoView)
@deps(TodoViewService)
export class TodoViewHook {
    _service: TodoViewService

    constructor(service: TodoViewService) {
        this._service = service
    }

    willMount({item}: {item: Todo}) {
        this._service.setTodo(item)
    }
}

// Provide class names and data for jss in __css property
@deps(ThemeVars)
@theme
class TodosViewTheme {
    wrapper: string
    status: string
    title: string

    __css: mixed

    constructor(vars: ThemeVars) {
        this.__css = {
            wrapper: {
                color: `${vars.color}`
            },
            status: {
                color: 'red'
            },
            title: {
                color: 'green'
            }
        }
    }
}

class LoadingStatus extends SourceStatus {
    static statuses = [Todos]
}

class SavingStatus extends SourceStatus {
    static statuses = [TodoService]
}

interface TodosState {
    theme: TodosViewTheme;
    addedTodo: AddedTodo;
    refs: TodoRefs;
    loading: LoadingStatus;
    saving: SavingStatus;
    service: TodoService;
}

interface TodosProps {
    children?: mixed;
}

function TodosViewColl(_p: {}, {items}: {items: Todos}, _t: any) {
    return <div>
        {items.map((todo: Todo) => <TodoView key={todo.id} item={todo} />)}
    </div>
}
deps({
    items: Todos
})(TodosViewColl)
component()(TodosViewColl)

function TodosView(
    props: {},
    {theme: t, addedTodo, saving, loading, refs, service}: TodosState,
    _t: any
) {
    if (loading.pending) {
        return <div className={t.wrapper}>Loading...</div>
    }
    if (loading.error) {
        return <div className={t.wrapper}>Loading error: {loading.error.message}</div>
    }
    const todoSetter = getSrc(addedTodo).eventSetter()

    return <div className={t.wrapper}>
        <span className={t.title}>Todo: <input
            ref={refs.title.set}
            value={addedTodo.title}
            title="todo.title"
            id="todo.id"
            onInput={todoSetter.title}
        /></span>
        <button disabled={saving.pending} onClick={service.submit}>
            {saving.pending ? 'Saving...' : 'Save'}
        </button>
        {saving.error
            ? <div>Saving error: {saving.error.message}</div>
            : null
        }
        <TodosViewColl />
    </div>
}
deps({
    theme: TodosViewTheme,
    addedTodo: AddedTodo,
    refs: TodoRefs,
    loading: LoadingStatus,
    saving: SavingStatus,
    service: TodoService
})(TodosView)
component()(TodosView)

function ErrorView(
    {error}: {error: Error},
    _state: {},
    _t: any
) {
    return <div>{error.message}</div>
}
component()(ErrorView)

class Logger {
    onError(e: Error, name: string): void {
        /* eslint-disable no-console */
        console.error(e, name)
    }

    onSetValue<V>(info: ICallerInfo<V>): void {
        /* eslint-disable no-console */
        console.log(
            `\n ${info.trace} #${info.opId} set ${info.modelName}\nfrom`,
            info.oldValue,
            '\nto',
            info.newValue
        )
    }
}

const di = (new DiFactory({
    values: {
        Fetcher: new Fetcher()
    },
    logger: Logger,
    defaultErrorComponent: ErrorView,
    themeFactory: createJss({
        plugins: [
            jssCamel()
        ]
    }),
    componentFactory: new ReactComponentFactory({
        Component,
        createElement
    })
}))
    .create()

render(
    createElement(di.wrapComponent(TodosView)),
    window.document.getElementById('app')
)
