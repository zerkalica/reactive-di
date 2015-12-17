/* @flow */
import EntityMeta, {create} from '../../common/EntityMeta'
import type {EntityMetaRec} from '../../common/EntityMeta'

type Query = {[id: string]: string};

type RouteRec = {
    page?: ?string,
    query?: Query,
    $meta?: EntityMetaRec
}

export default class Route {
    page: ?string;
    query: Query;
    $meta: EntityMeta;

    constructor(rec?: RouteRec = {}) {
        this.page = rec.page || null
        this.query = rec.query || {}
        this.$meta = create(rec.$meta, EntityMeta)
    }

    copy(rec: RouteRec): Route {
        return new Route({...this, ...rec})
    }
}
