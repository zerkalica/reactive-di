/* eslint-env mocha */
/* @flow */
import assert from 'power-assert'
import updateIdsMap from '../updateIdsMap'
import DepMeta from '../DepMeta'
import type {DepId, IdsMap} from '../../interfaces'

// declare function describe(name: string, cb: () => void): void;
// declare function it(name: string, cb: () => void): void;

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
    it('should resolve deps B->a, A->b, C->c, state: {a: {b, c}}', () => {
        const a = createMeta('a')
        const b = createMeta('b')
        const c = createMeta('c')

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

    it('should resolve deps B->A&b, A->a, state: {a, b}', () => {
        const a = createMeta('a')
        const b = createMeta('b')
        const A = createMeta('A', a)
        const B = createMeta('B', A, b)
        const idToStateIdsMap: IdsMap = {
            a: ['a'],
            b: ['b']
        };

        const stateIdToIdsMap = updateMap(idToStateIdsMap, B)
        const result = {
            a: ['A', 'B'],
            b: ['B']
        }
        assert.deepEqual(stateIdToIdsMap, result)
    })

    it('should resolve deps B->A&a, A->b, state: {a: {b}}', () => {
        const a = createMeta('a')
        const b = createMeta('b')
        const A = createMeta('A', b)
        const B = createMeta('B', A, a)
        const idToStateIdsMap: IdsMap = {
            a: ['a', 'b'],
            b: ['b']
        };

        const stateIdToIdsMap = updateMap(idToStateIdsMap, B)
        const result = {
            a: ['B'],
            b: ['A', 'B']
        }
        assert.deepEqual(stateIdToIdsMap, result)
    })

    it('should resolve deps B->A, C->B, A->a, state: {a}', () => {
        const a = createMeta('a')
        const idToStateIdsMap: IdsMap = {
            a: ['a']
        };
        const A = createMeta('A', a)
        const B = createMeta('B', A)
        const C = createMeta('C', B)

        const stateIdToIdsMap = updateMap(idToStateIdsMap, C)
        const result = {
            a: ['A', 'B', 'C']
        }
        assert.deepEqual(stateIdToIdsMap, result)
    })

    it('should resolve deps B->A, C->A, A->a, state: {a}', () => {
        const a = createMeta('a')
        const idToStateIdsMap: IdsMap = {
            a: ['a']
        };
        const A = createMeta('A', a)
        const B = createMeta('B', A)
        const C = createMeta('C', A)

        const stateIdToIdsMap = updateMap(idToStateIdsMap, B, C)
        const result = {
            a: ['A', 'B', 'C']
        }
        assert.deepEqual(stateIdToIdsMap, result)
    })

    it('should resolve deps A->C&B, B->C&b, C->a, D->B, state: {a, b}', () => {
        const a = createMeta('a')
        const b = createMeta('b')
        const C = createMeta('C', a)
        const B = createMeta('B', C, b)
        const D = createMeta('D', B)
        const A = createMeta('A', C, B)
        const idToStateIdsMap: IdsMap = {
            a: ['a'],
            b: ['b']
        };

        const stateIdToIdsMap = updateMap(idToStateIdsMap, A, D)
        const result = {
            a: ['C', 'B', 'A', 'D'],
            b: ['B', 'A', 'D']
        }
        assert.deepEqual(stateIdToIdsMap, result)
    })

    it('should resolve deps A->C&B, B->C&b, C->a, state: {a, b}', () => {
        const a = createMeta('a')
        const b = createMeta('b')
        const C = createMeta('C', a)
        const B = createMeta('B', C, b)
        const A = createMeta('A', C, B)
        const idToStateIdsMap: IdsMap = {
            a: ['a'],
            b: ['b']
        };

        const stateIdToIdsMap = updateMap(idToStateIdsMap, A)
        const result = {
            a: ['C', 'B', 'A'],
            b: ['B', 'A']
        }
        assert.deepEqual(stateIdToIdsMap, result)
    })

    it('should resolve deps B->A&a, A->a, state: {a}', () => {
        const a = createMeta('a')
        const A = createMeta('A', a)
        const B = createMeta('B', A, a)
        const idToStateIdsMap: IdsMap = {
            a: ['a']
        };

        const stateIdToIdsMap = updateMap(idToStateIdsMap, B)
        const result = {
            a: ['A', 'B']
        }
        assert.deepEqual(stateIdToIdsMap, result)
    })
})
