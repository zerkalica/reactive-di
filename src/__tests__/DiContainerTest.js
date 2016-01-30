/* eslint-env mocha */
/* @flow */

import assert from 'power-assert'
import annotations from './annotations'
import createPureStateDi from '../createPureStateDi'
import {AppState, CurrentUser} from './TestState'

const {
    factory,
    setter
} = annotations

function currentUserFacet(user: CurrentUser): CurrentUser {
    return user
}
factory(CurrentUser)(currentUserFacet)

function ChangeCurrentUserName(user: CurrentUser): (name: string) => CurrentUser {
    return function changeCurrentUserName(name: string): User {
        return user.copy({name})
    }
}
setter(CurrentUser, CurrentUser)(ChangeCurrentUserName)

describe('DiContainerTest', () => {
    it('facet should return CurrentUser instance', () => {
        const state = new AppState()
        const di = createPureStateDi(state)
        const currentUser: CurrentUser = di.get(currentUserFacet);
        assert(currentUser instanceof CurrentUser)
    })

    it('setter should change instance', () => {
        const state = new AppState()
        const di = createPureStateDi(state)

        const currentUser: CurrentUser = di.get(currentUserFacet);
        assert(currentUser instanceof CurrentUser)
        const changeUserName = di.get(ChangeCurrentUserName)
        changeUserName('new-name')

        const newCurrentUser: CurrentUser = di.get(currentUserFacet);
        assert(newCurrentUser instanceof CurrentUser)
        assert(newCurrentUser !== currentUser)
        assert(newCurrentUser.name === 'new-name')
    })
})
