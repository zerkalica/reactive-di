/* @flow */
/* eslint-env mocha */
import assert from 'power-assert'
import createDepMetaFromState from '../createDepMetaFromState'
import type {DepId} from '../../interfaces'
import {spy} from 'sinon'

function getDepId(obj: Object): DepId {
    return obj.constructor.$id
}

class Meta {
    _notify: () => void;
}

class A {
    static $id: string = 'a';

    name: string;
    $meta: Meta;

    constructor() {
        this.$meta = new Meta()
    }
}

class C {
    static $id: string = 'c';
    name: string;
    $meta: Meta;

    constructor() {
        this.$meta = new Meta()
    }
}

class B {
    c: C;
    $meta: Meta;
    static $id: string = 'b';

    constructor() {
        this.c = new C()
        this.$meta = new Meta()
    }
}

class S {
    a: A;
    b: B;

    static $id: string = 's';
    $meta: Meta;
    constructor() {
        this.a = new A()
        this.b = new B()
        this.$meta = new Meta()
    }
}

describe('createDepMetaFromStateTest', () => {
    it('should build deps for {a, {b: c}', () => {
        const s = new S()
        function notify() {}
        const {depMap, pathMap} = createDepMetaFromState(s, notify, getDepId)

        assert.deepEqual(pathMap, {
            s: [],
            a: ['a'],
            b: ['b'],
            c: ['b', 'c']
        })
        assert.deepEqual(depMap, {
            s: ['s', 'a', 'b', 'c'],
            a: ['s', 'a'],
            b: ['s', 'b', 'c'],
            c: ['s', 'b', 'c']
        })
    })

    it('should call notify with dep id', () => {
        const notify = spy()
        const s = new S()
        createDepMetaFromState(s, notify, getDepId)
        s.a.$meta._notify()
        s.b.c.$meta._notify()
        assert(notify.calledTwice)
        assert(notify.firstCall.calledWith('a'))
        assert(notify.secondCall.calledWith('c'))
    })
})
