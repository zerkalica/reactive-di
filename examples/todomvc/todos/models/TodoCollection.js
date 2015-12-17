/* @flow */
import Todo from './Todo'
import Collection from '../../common/Collection'

export default class TodoCollection extends Collection<Todo> {
    userId: ?string;

    constructor(items?: Array<Todo>, userId?: ?string) {
        super(items)
        this.userId = userId || null
    }

    _create(items: Array<Todo>): Collection<Todo> {
        return new TodoCollection(items, this.userId)
    }
}
