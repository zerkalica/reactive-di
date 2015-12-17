/* eslint-env mocha */
/* @flow */
import ReactiveDi from '../ReactiveDi'
import {classDep, factoryDep} from '../annotations'
import EntityMeta from '../../common/EntityMeta'

class User {
    id: string;
    name: string;

    constructor(rec: {
        id?: string,
        name?: string
    }) {
        this.id = rec.id || '1'
        this.name = rec.name || ''
    }
}

class UserCollection extends Array<User> {
    constructor(rec: {
        $meta?: EntityMeta
    }) {
        super()
        EntityMeta.set(this, rec.$meta)
    }
}


class SelectedUserId {
    id: string;

    constructor(rec: {
        id?: string
    }) {
        this.id = rec.id || ''
        EntityMeta.set(this, {
            invalid: !!this.id
        })
    }
}

class UserStore {
    users: UserCollection;
    selected: SelectedUserId;

    constructor(rec: {
        users?: UserCollection,
        selected: SelectedUserId,
        $meta?: EntityMetaRec
    }) {
        this.users = rec.users || new UserCollection()
        this.selected = rec.selected || new SelectedUserId()
        this.$meta = EntityMeta.copy(this.users.$meta)
    }
}

class AppStore {
    userStore: UserStore;

    constructor(rec: {
        userStore?: UserStore
    }) {
        this.userStore = rec.userStore || new UserStore()
        EntityMeta.assign(this, this.userStore)
    }
}

class SelectedUserFacet {
    selectedUser: User;
    userCount: number;

    constructor(rec: {
        users: UserCollection,
        selected: SelectedUserId
    }) {
        const $meta = EntityMeta.get(rec.users)

        if ($meta.invalid) {
            this.selectedUser = new User({$meta})
        } else {
            this.selectedUser = rec.users.find(user => user.id === rec.selected.id)
        }
        this.userCount = rec.users.length

        EntityMeta.assign(this, rec.users, rec.selected)
    }
}
classDep(SelectedUserFacet)({
    users: UserCollection,
    selected: SelectedUserId
})


function widget(props: SelectedUserFacet): string {
    let result
    const {selectedUser, userCount} = props
    const $meta = EntityMeta.get(props)
    if ($meta.loading) {
        result ='Facet is loading...'
    } else if ($meta.invalid) {
        result = `Facet is invalid: ${$meta.error.message}`
    } else {
        result = `selectedUser ${selectedUser.id}/${selectedUser.name}, userCount is ${userCount}`
    }
    return result
}
factoryDep(widget)(SelectedUserFacet)

function getState(path: Array<string>): Object {
    // redux get state + getIn(path)
    return {}
}

describe('MetaLoaderTest', () => {
    it('should', () => {
        const metaLoader = new ReactiveDi(getState, state)
        metaLoader.get(widget)
    })
})
