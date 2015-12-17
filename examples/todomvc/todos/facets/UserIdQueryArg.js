/* @flow */

import EntityMeta from '../../common/EntityMeta'
import Route from '../../system/models/Route'

export default class UserIdQueryArg {
    $meta: EntityMeta;
    userId: string;

    constructor(route: Route) {
        this.userId = route.query.userId
        let $meta
        if (!this.userId) {
            $meta = {error: new Error('Arg userId not found in query')}
        } else {
            $meta = route.$meta
        }
        this.$meta = new EntityMeta($meta)
    }
}
