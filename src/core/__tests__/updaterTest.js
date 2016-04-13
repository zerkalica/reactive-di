/* @flow */
/* eslint-env mocha */

import assert from 'power-assert'

import {
    createContainer
} from 'reactive-di/core/__tests__/createContainer'
import type {
    Container
} from 'reactive-di/i/coreInterfaces'

import {
    factory
} from 'reactive-di/configurations'

function depName(dep: Provider): string {
    return dep.displayName
}

describe('HotRelationUpdaterTest', () => {
    it('should cache dependency deps', () => {
        const A = () => 1;
        const B = (c: number) => 2 + c;
        const C = (a: number) => 3 + a;

        const di: Container = createContainer([
            factory(A),
            factory(C, A),
            factory(B, C)
        ], [], true);

        di.getProvider(C)

        const result = di.getProvider(B).getDependants()
            .map(depName);

        assert.deepEqual(result, [
            'factory@B',
            'factory@C',
            'factory@A'
        ])
    })

    it('should wrap deps', () => {
        const A = () => 1;
        const B = (c: number, a: number) => 2 + c + a;
        const C = (a: number) => 3 + a;
        const di: Container = createContainer([
            factory(A),
            factory(C, A),
            factory(B, C, A)
        ], [], true);

        const result = di.getProvider(B).getDependants().map(depName);

        assert.deepEqual(result, [
            'factory@B',
            'factory@C',
            'factory@A'
        ])
    })

    it('should add dependants in A, B->C, C->A: A, B->C&A, C->A', () => {
        const A = () => 1;
        const B = (c: number) => 2 + c;
        const C = (a: number) => 3 + a;
        const di: Container = createContainer([
            factory(A),
            factory(C, A),
            factory(B, C)
        ], [], true);

        const result = di.getProvider(B).getDependants().map(depName)

        assert.deepEqual(result, [
            'factory@B',
            'factory@C',
            'factory@A'
        ])
    })

    it('should resolve dependencies after dependants in A, B->C, C->A: A, B->C&A, C->A', () => {
        const A = () => 1;
        const B = (c: number) => 2 + c;
        const C = (a: number) => 3 + a;
        const di: Container = createContainer([
            factory(A),
            factory(C, A),
            factory(B, C)
        ], [], true);

        const dependencies = di.getProvider(A).getDependencies()

        assert.deepEqual(dependencies.map(depName), [
            'factory@A'
        ])

        di.getProvider(B).getDependants().map(depName)

        assert.deepEqual(dependencies.map(depName), [
            'factory@A',
            'factory@C',
            'factory@B'
        ])
    })
})
