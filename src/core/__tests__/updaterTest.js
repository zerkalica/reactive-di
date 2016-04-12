/* @flow */
/* eslint-env mocha */

import sinon from 'sinon'
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
    it('should cache child deps', () => {
        const A = () => 1;
        const B = (c: number) => 2 + c;
        const C = (a: number) => 3 + a;

        const di: Container = createContainer([
            factory(A),
            factory(C, A),
            factory(B, C)
        ], [], true);

        di.getProvider(C)

        const result = di.getProvider(B).getParents()
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

        const result = di.getProvider(B).getParents().map(depName);

        assert.deepEqual(result, [
            'factory@B',
            'factory@C',
            'factory@A'
        ])
    })

    it('should add parents in A, B->C, C->A: A, B->C&A, C->A', () => {
        const A = () => 1;
        const B = (c: number) => 2 + c;
        const C = (a: number) => 3 + a;
        const di: Container = createContainer([
            factory(A),
            factory(C, A),
            factory(B, C)
        ], [], true);

        const result = di.getProvider(B).getParents().map(depName)

        assert.deepEqual(result, [
            'factory@B',
            'factory@C',
            'factory@A'
        ])
    })

    it('should resolve childs after parents in A, B->C, C->A: A, B->C&A, C->A', () => {
        const A = () => 1;
        const B = (c: number) => 2 + c;
        const C = (a: number) => 3 + a;
        const di: Container = createContainer([
            factory(A),
            factory(C, A),
            factory(B, C)
        ], [], true);

        const childs = di.getProvider(A).getChilds()

        assert.deepEqual(childs.map(depName), [
            'factory@A'
        ])

        di.getProvider(B).getParents().map(depName)

        assert.deepEqual(childs.map(depName), [
            'factory@A',
            'factory@C',
            'factory@B'
        ])
    })
})
