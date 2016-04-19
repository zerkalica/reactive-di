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
    it('should add dependency', () => {
        const A = () => 1;
        const B = (a: number) => 2 + a;

        const di: Container = createContainer([
            factory(A),
            factory(B, A)
        ], [], true);

        const result = di.getProvider(B).dependencies.map(depName);
        // console.log(result, di.getProvider(B).displayName)
        assert.deepEqual(result, [
            'factory@B',
            'factory@A'
        ])
    })

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

        const result = di.getProvider(B).dependencies.map(depName);
        // console.log(result, di.getProvider(B).displayName)
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


        const result = di.getProvider(B).dependencies.map(depName);

        assert.deepEqual(result, [
            'factory@B',
            'factory@C',
            'factory@A'
        ])
    })

    it('should add dependencies in A, B->C, C->A: A, B->C&A, C->A', () => {
        const A = () => 1;
        const B = (c: number) => 2 + c;
        const C = (a: number) => 3 + a;
        const di: Container = createContainer([
            factory(A),
            factory(C, A),
            factory(B, C)
        ], [], true);

        const result = di.getProvider(B).dependencies.map(depName);

        assert.deepEqual(result, [
            'factory@B',
            'factory@C',
            'factory@A'
        ])
    })
})
