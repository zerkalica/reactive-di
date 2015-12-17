/* eslint-env mocha */
/* flow */
import assert from 'power-assert'
import updateIdsMap from '../updateIdsMap'
import DepMeta from '../DepMeta'
import type {DepId, IdsMap} from '../../interfaces'

declare function describe(name: string, cb: () => void): void;
declare function it(name: string, cb: () => void): void;

function createMeta(id: DepId, ...deps: Array<DepMeta>): DepMeta {
    return new DepMeta({
        id,
        deps,
        fn: () => null
    })
}

function updateMap(idToStateIdsMap: IdsMap, ...deps: Array<DepMeta>): IdsMap {
    const stateIdToIdsMap = {};
    deps.forEach(dep =>
        updateIdsMap(dep.id, dep.deps, stateIdToIdsMap, idToStateIdsMap)
    )
    return stateIdToIdsMap
}

describe('updateIdsMapTest', () => {
    it('should resolve deps', () => {
        const a = createMeta('a');
        const b = createMeta('b');
        const c = createMeta('c');

        const idToStateIdsMap: IdsMap = {
            a: ['a', 'b', 'c'],
            b: ['a', 'b'],
            c: ['a', 'c']
        };

        const A = createMeta('A', b)
        const B = createMeta('B', a)
        const C = createMeta('C', c)

        const stateIdToIdsMap = updateMap(idToStateIdsMap, A, B, C)

        const result = {
            a: ['A', 'B', 'C'],
            b: ['A', 'B'],
            c: ['B', 'C']
        }
        assert.deepEqual(stateIdToIdsMap, result)
    })
})
