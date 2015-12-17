/* @flow */

import EntityMeta, {create, copyProps} from '../../common/EntityMeta'
import type {EntityMetaRec} from '../../common/EntityMeta'

export type TodoDescriptionRec = {
    todoId?: ?string;
    text?: ?string;
    $meta?: EntityMetaRec;
}

export default class TodoDescription {
    id: ?string;
    todoId: ?string;
    text: ?string;
    $meta: EntityMeta;

    constructor(rec: TodoDescriptionRec = {}) {
        this.id = this.todoId = rec.todoId || null
        this.text = rec.text || null
        this.$meta = create(rec.$meta, EntityMeta)
    }

    copy(rec: TodoDescriptionRec): TodoDescription {
        return new TodoDescription(copyProps(this, rec))
    }
}
