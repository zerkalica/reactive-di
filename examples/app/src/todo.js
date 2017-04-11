// @flow
/* eslint-env browser */
/* eslint-disable no-console */

// import {Component, createElement} from 'react'
// import {render} from 'react-dom'

import {render, createVNode as infernoCreateVNode} from 'inferno'
import Component from 'inferno-component'

import {create as createJss} from 'jss'
import jssCamel from 'jss-camel-case'

import {
    createReactRdiAdapter,
    SourceStatus,
    DiFactory,
    BaseSetter
} from 'reactive-di/index'
import type {ResultOf, ICallbacks, IComponentInfo, ICallerInfo} from 'reactive-di/index'
import {src, actions, component, hooks, theme} from 'reactive-di/annotations'
import Fetcher from './common/Fetcher'

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

let counter = maxTodos
class Todo {
    id = ++counter
    title = ''
    email = ''
}

class Todos extends Array<Todo> {}

@hooks(Todos)
class TodosHooks {
    _fetcher: Fetcher
    constructor(fetcher: Fetcher) {
        this._fetcher = fetcher
    }

    pull(): Promise<Todo[]> {
        return this._fetcher.fetch('/todos', {method: 'GET'})
    }
}

class AddedTodo extends Todo {
    title: string
}

// Model ThemeVars, could be injected from outside by key 'ThemeVars' as ThemeVarsRec
class ThemeVars {
    color = 0
}

class TodoRefs {
    title: ?HTMLElement = null
}
@hooks(TodoRefs)
class TodoRefsHooks {

    merge(m: TodoRefs, old: TodoRefs): ?TodoRefs {
        return m.title === old.title ? null : m
    }

    put(ref: TodoRefs) {
        console.log('after attach to dom: ', ref.title)
    }

    reap(ref: TodoRefs) {
        console.log('will detached from dom: ', ref.title)
    }
}

class TodoServiceSubmitResult {}

@actions
class TodoService {
    _tv: ThemeVars
    _refs: TodoRefs
    _todoServiceSubmitResult: TodoServiceSubmitResult
    _addedTodo: AddedTodo
    _fetcher: Fetcher
    _todos: Todos

    setRefs: ICallbacks<TodoRefs, HTMLElement>

    constructor(
        fetcher: Fetcher,
        todos: Todos,
        refs: TodoRefs,
        tv: ThemeVars,
        todoServiceSubmitResult: TodoServiceSubmitResult,
        addedTodo: AddedTodo
    ) {
        this.setRefs = new BaseSetter(refs).create(BaseSetter.createSet)
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

        src(this._todoServiceSubmitResult).update({
            run(): Promise<$Shape<TodoServiceSubmitResult>> {
                return fetcher.fetch('/todo', {
                    method: 'POST',
                    body: JSON.stringify(addedTodo)
                }).then(() => {})
            },
            complete(): void {
                const newTodos = todos.slice(0)
                newTodos.push(Object.assign(new Todo(), addedTodo))
                src(todos).set(newTodos)
                src(addedTodo).reset({
                    id: addedTodo.id++
                })
            }
        })
    }

    changeColor(): void {
        src(this._tv).set({color: 'green'})
    }
}

class EditingTodo extends Todo {
    title: string
}

@actions
class TodoViewService {
    _todos: Todos
    _todo: Todo
    _editingTodo: EditingTodo

    constructor(todos: Todos, editingTodo: EditingTodo) {
        this._todos = todos
        this._editingTodo = editingTodo
    }

    removeTodo(todo: Todo): void {
        src(this._todos).set(this._todos.filter((t: Todo) => t !== todo))
    }

    beginEdit(todo: Todo): void {
        src(this._editingTodo).set(this._todo || todo)
    }

    submitEdit(): void {
        const et = this._editingTodo
        const newTodos: Todo[] = this._todos.map(
            (t: Todo) => (
                t.id === et.id ? et : t
            )
        )
        src(this._todos).set(newTodos)
        src(this._editingTodo).reset()
    }

    cancelEdit(): void {
        src(this._editingTodo).reset()
    }
}

class EditingTodoSetter {
    eventSet: ICallbacks<EditingTodo, Event>

    constructor(v: EditingTodo) {
        const bs = new BaseSetter(v)
        this.eventSet = bs.create(BaseSetter.createEventSet)
    }
}
function EditTodoView(
    {item}: {
        item: Todo;
    },
    {editingTodo, service, setter}: {
        editingTodo: EditingTodo;
        service: TodoViewService;
        setter: EditingTodoSetter;
    }
) {
    return <div>
        <input
            name="editTodo"
            value={editingTodo.title}
            onInput={setter.eventSet.title}
        />
        <button onClick={service.submitEdit}>Save</button>
        <button onClick={service.cancelEdit}>Cancel</button>
    </div>
}

function TodoView(
    {item}: {
        item: Todo
    },
    {editingTodo, service}: {
        editingTodo: EditingTodo;
        service: TodoViewService;
    }
) {
    const isEdited = editingTodo.id === item.id

    if (isEdited) {
        return <EditTodoView item={item} />
    }

    return <div>
        <span>{item.id} - {item.title}</span>
        <button onClick={() => service.beginEdit(item)}>Edit</button>
        <button onClick={() => service.removeTodo(item)}>X</button>
    </div>
}
component({
    // Separate state per TodoView
    register: []
})(TodoView)

// Provide class names and data for jss in __css property
@theme
class TodosViewTheme {
    wrapper: string
    status: string
    title: string

    __css: mixed

    constructor(vars: ThemeVars) {
        this.__css = {
            wrapper: {
                color: `rgb(${vars.color}, 0, 0)`
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

class AddedTodoSetter {
    set: ICallbacks<AddedTodo, string>
    eventSet: ICallbacks<AddedTodo, Event>

    constructor(v: AddedTodo) {
        const bs = new BaseSetter(v)
        this.set = bs.create(BaseSetter.createSet)
        this.eventSet = bs.create(BaseSetter.createEventSet)
    }
}

function createThemeVarsSetter(m: ThemeVars): ICallbacks<ThemeVars, *> {
    return new BaseSetter(m).create(BaseSetter.createEventSet)
}

function TodosViewColl(_p: {}, {items}: {items: Todos}) {
    return <div>
        {items.map((todo: Todo) => <TodoView key={todo.id} item={todo} />)}
    </div>
}

function TodosView(
    props: {},
    {theme: t, setTheme, addedTodo, saving, loading, service, setter, themeVars}: {
        theme: TodosViewTheme;
        addedTodo: AddedTodo;
        refs: TodoRefs;
        loading: LoadingStatus;
        saving: SavingStatus;
        service: TodoService;
        setter: AddedTodoSetter;
        themeVars: ThemeVars;
        setTheme: ResultOf<typeof createThemeVarsSetter>;
    }
) {
    if (loading.pending) {
        return <div className={t.wrapper}>Loading...</div>
    }
    if (loading.error) {
        return <div className={t.wrapper}>Loading error: {loading.error.message}</div>
    }

    return <div className={t.wrapper}>
        <span className={t.title}>Todo: <input
            ref={service.setRefs.title}
            value={addedTodo.title}
            title="todo.title"
            id="todo.id"
            onInput={setter.eventSet.title}
        /></span>
        <button disabled={saving.pending} onClick={service.submit}>
            {saving.pending ? 'Saving...' : 'Save'}
        </button>
        {saving.error
            ? <div>Saving error: {saving.error.message}</div>
            : null
        }
        <TodosViewColl />
        Set color via css: <input
            type="range"
            min="0"
            max="255"
            step="5"
            name="color"
            value={themeVars.color}
            onInput={setTheme.color}
        />
    </div>
}

class Logger {
    onError(e: Error, name: string): void {
        /* eslint-disable no-console */
        console.error(e, name)
    }

    onRender<Props: Object>(info: IComponentInfo<Props>) {
        delete info.props._rdi
        console.log(`render ${info.displayName}#${info.id}` + JSON.stringify(info.props))
    }

    onSetValue<V>(info: ICallerInfo<V>): void {
        /* eslint-disable no-console */
        console.log(
            `${info.trace} #${info.opId} set ${info.modelName} `
                + String(info.oldValue) + ' -> ' + String(info.newValue)
        )
    }
}

// used in jsx below, jsx pragma t
const _t = new DiFactory({ // eslint-disable-line
    values: {
        Fetcher: new Fetcher({
            '/todos': (_params: Object) => {
                return todosFixture
            },
            '/todo': (_params: Object) => {
                return ''
            }
        })
    },
    createVNode: infernoCreateVNode,
    createComponent: createReactRdiAdapter(Component),
    logger: Logger,
    themeFactory: createJss({
        plugins: [
            jssCamel()
        ]
    })
})
    .create()

render(
    <TodosView/>,
    window.document.getElementById('app')
)
