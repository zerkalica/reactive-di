// @flow
/* eslint-env browser */

import React from 'react'
import ReactDOM from 'react-dom'
import jss from 'jss'
import jssCamel from 'jss-camel-case'

import {
    refsSetter,
    eventSetter,
    setter,
    BaseModel,
    Updater,
    SourceStatus,
    DiFactory,
    ReactComponentFactory,
    IndexCollection
} from 'reactive-di/index'
import type {ICallerRef, IDepInfo} from 'reactive-di/index'
import {actions, hooks, deps, theme, component, source} from 'reactive-di/annotations'

const todosFixture: any = []


const maxTodos = 3

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
class Todo extends BaseModel {
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
    _updater: Updater<Todos>

    value: Todos

    constructor(fetcher: Fetcher) {
        this._fetcher = fetcher
    }

    promise(): Promise<Todos> {
        return this._fetcher.fetch('/todos', {method: 'GET'})
    }

    willMount(todos: Todos): void {
        this.value = todos
        this._updater = new Updater(this)
        this._updater.run()
    }

    willUnmount(): void {
        this._updater.abort()
    }
}

@source({key: 'AddedTodo'})
class AddedTodo extends Todo {}

// Model ThemeVars, could be injected from outside by key 'ThemeVars' as ThemeVarsRec
@source({key: 'ThemeVars'})
class ThemeVars extends BaseModel {
    color = 'red'
}

class TodoRefs {
    title: ?HTMLElement = null
    set = refsSetter(this)
}

@source({key: 'TodoServiceSubmit'})
class TodoServiceSubmit extends SourceStatus {}


@deps(Fetcher, AddedTodo, Todos, TodoServiceSubmit)
class TodoUpdater {
    _fetcher: Fetcher
    _addedTodo: AddedTodo
    _todos: Todos

    value: TodoServiceSubmit

    constructor(
        fetcher: Fetcher,
        addedTodo: AddedTodo,
        todos: Todos,
        submitStatus: TodoServiceSubmit
    ) {
        this._fetcher = fetcher
        this._todos = todos
        this._addedTodo = addedTodo
        this.value = submitStatus
    }

    promise(): Promise<TodoServiceSubmit> {
        return this._fetcher.fetch('/todo', {
            method: 'POST',
            body: JSON.stringify(this._addedTodo)
        })
    }

    complete(): void {
        this._todos.push(this._addedTodo)
        this._addedTodo.reset()
    }
}

@deps(
    TodoRefs,
    ThemeVars,
    TodoUpdater,
    AddedTodo
)
@actions
class TodoService {
    _tv: ThemeVars
    _refs: TodoRefs
    _todoUpdater: Updater<*>
    event: {[id: string]: (v: any) => void}

    constructor(
        refs: TodoRefs,
        tv: ThemeVars,
        todoUpdater: TodoUpdater,
        addedTodo: AddedTodo
    ) {
        this._tv = tv
        this._refs = refs
        this.event = eventSetter(addedTodo)
        this._todoUpdater = new Updater(todoUpdater)
    }

    submit(): void {
        this._todoUpdater.run()
    }

    changeColor(): void {
        setter(this._tv).color('green')
    }
}


function TodoView({item}: {item: Todo}, _state: {}, _t: any) {
    return <div>{item.id} - {item.title}</div>
}
component()(TodoView)

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
                backgroundColor: `rgb(${vars.color}, 0, 0)`
            },
            status: {
                backgroundColor: 'red'
            },
            title: {
                backgroundColor: 'green'
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

    const todoSetter = service.event

    return <div className={t.wrapper}>
        <span className={t.title}>Todo: <input
            ref={refs.set.title}
            value={addedTodo.title}
            title="todo.title"
            id="todo.id"
            onChange={todoSetter.title}
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
    _t: any
) {
    return <div>{error.message}</div>
}
component()(ErrorView)

jss.use(jssCamel)

class Middleware {
    onSetValue<V>(src: IDepInfo<V>, newVal: V, trace: string[]): void {
        console.log(
            `\n${trace.join('.')} set ${src.displayName}\nfrom`,
            src.cached,
            '\nto',
            newVal
        )
    }
}

const di = (new DiFactory({
    values: {
        Fetcher: new Fetcher()
    },
    middlewares: new Middleware(),
    defaultErrorComponent: ErrorView,
    themeFactory: jss,
    componentFactory: new ReactComponentFactory(React)
}))
    .create()

ReactDOM.render(
    React.createElement(di.wrapComponent(TodosView)),
    window.document.getElementById('app')
)
