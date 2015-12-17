/* @flow */
import EntityMeta, {create, copyProps} from '../../common/EntityMeta'
import type {EntityMetaRec} from '../../common/EntityMeta'

export type TodoRec = {
    id?: ?string,
    title?: ?string,
    userId?: ?string,
    $meta?: EntityMetaRec
}

export default class Todo {
    id: ?string;
    userId: ?string;
    title: ?string;
    $meta: EntityMeta;

    constructor(rec: TodoRec = {}) {
        this.id = rec.id || null
        this.title = rec.title || null
        this.userId = rec.userId || null
        this.$meta = create(rec.$meta, EntityMeta)
    }

    copy(rec: TodoRec): Todo {
        return new Todo(copyProps(this, rec))
    }
}
