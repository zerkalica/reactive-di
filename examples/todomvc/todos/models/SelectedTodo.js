/* @flow */
import EntityMeta, {create, copyProps} from '../../common/EntityMeta'
import type {EntityMetaRec} from '../../common/EntityMeta'

export type SelectedTodoRec = {
    id?: ?string,
    $meta?: EntityMetaRec
}

export default class SelectedTodo {
    id: ?string;
    $meta: EntityMeta;

    constructor(rec: SelectedTodoRec = {}) {
        this.id = rec.id || null
        this.$meta = create(rec.$meta, EntityMeta)
    }

    copy(rec: SelectedTodoRec): SelectedTodo {
        return new SelectedTodo(copyProps(this, rec))
    }
}
