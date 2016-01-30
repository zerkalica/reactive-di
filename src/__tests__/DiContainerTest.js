/* eslint-env mocha */
/* @flow */

import assert from 'power-assert'
import annotations from './annotations'
import createPureStateDi from '../createPureStateDi'
import {AppState, CurrentUser} from './TestState'

const {factory} = annotations

function currentUserFacet(user: CurrentUser): CurrentUser {
    return user
}
factory(CurrentUser)(currentUserFacet)

describe('DiContainerTest', () => {
    it('facet should return CurrentUser instance', () => {
        const state = new AppState()
        const di = createPureStateDi(state)
        const currentUser: CurrentUser = di.get(currentUserFacet);
        assert(currentUser instanceof CurrentUser)
    })
})
