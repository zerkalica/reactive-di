/* @flow */

import {model} from '../../annotations'

function LoadUserCollection(users: EntityMeta<UserCollection>) {
    return function loadUserCollection<T>(
        rec: {
            pending?: boolean,
            fulfilled: ?boolean,
            rejected?: boolean,
            reason?: Error
        },
        rawUsers?: Array<T>
    ): EntityMeta<UserCollection> {
        return users.copy({
            ...rec,
            value: rawUsers ? new UserCollection(rawUsers) : users.value
        })
    }
}


function createEntityMeta(statePart: DepMeta) {
    function fn<T>(rec: Meta, value: T): EntityMeta<T> {
        const rec = map(statePart.id)
        return new EntityMeta({
            ...rec,
            value
        })
    }

    return new DepMeta({
        deps: [statePart],
        fn
    })
}

export default model(UserCollectionMeta)(LoadUserCollection)
