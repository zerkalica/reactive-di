/* @flow */
import TodoDescriptionCollection from './TodoDescriptionCollection'
import TodoDescription from './TodoDescription'
import TodoCollection from './TodoCollection'
import Todo from './Todo'
import Collection from '../../common/Collection'
import SelectedTodo from './SelectedTodo'
import EntityMeta, {create, copyProps} from '../../common/EntityMeta'

import type {SelectedTodoRec} from './SelectedTodo'

export type TodoStoreRec = {
    items?: Collection<Todo>;
    selectedTodo?: SelectedTodo;
    descriptions?: Collection<TodoDescription>;
}

export default class TodoStore {
    items: TodoCollection;
    selectedTodo: SelectedTodo;
    descriptions: TodoDescriptionCollection;
    $meta: EntityMeta;

    constructor(rec: TodoStoreRec = {}) {
        this.items = create(rec.items, TodoCollection)
        this.selectedTodo = create(rec.selectedTodo, SelectedTodo)
        this.descriptions = create(rec.descriptions, TodoDescriptionCollection)
        this.$meta = EntityMeta.fromArray([this.descriptions, this.items, this.selectedTodo])
    }

    copy(rec: TodoStoreRec = {}): TodoStore {
        return new TodoStore(copyProps(this, rec))
    }
}
