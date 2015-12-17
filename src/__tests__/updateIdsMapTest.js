/* @flow */
/* eslint-env mocha */
import {factory} from '../annotations'
import updateIdsMap from '../updateIdsMap'

class C {}
class B {}
class A {
    // b: B = new B();
    // c: C = new C();
}
/*
describe('updateIdsMap', () => {
    it('B->a, A->a.b, C->a.c to a: [A, B, C], a.b: [A], a.c: [C]', () => {
        const pathToIdsMap = new Map()
        const idToPathsMap = new Map()
        const DepA = factoryDep([B])(v => v)
        const DepB = factoryDep([A])(v => v)
        const DepC = factoryDep([C])(v => v)
        DepA.__di.id = 'A'
        DepB.__di.id = 'B'
        DepC.__di.id = 'C'

        updateIdsMap(DepB, pathToIdsMap, idToPathsMap)
        updateIdsMap(DepA, pathToIdsMap, idToPathsMap)
        updateIdsMap(DepC, pathToIdsMap, idToPathsMap)
        assert.deepEqual(pathToIdsMap, {
            A: [DepA, DepB, DepC],
            B: [DepB, DepA],
            C: [DepC, DepA]
        })
    })
})
*/
