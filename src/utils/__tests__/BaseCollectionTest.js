/* @flow */
/* eslint-env mocha */
import assert from 'power-assert'
import BaseCollection from '../BaseCollection'
import merge from '../merge'

// import {spy} from 'sinon'

type TestElRec = {
    id?: string;
    name?: string;
    w?: number;
}
class TestEl {
    id: string;
    w: number;
    name: ?string;

    constructor(rec: TestElRec = {}) {
        this.id = rec.id || '0'
        this.name = rec.name || null
        this.w = rec.w || 0
    }

    copy(rec: TestElRec): TestEl {
        return merge(this, rec)
    }
}

class TestColl extends BaseCollection<TestEl> {
    createItem(rec: Object): TestEl {
        return new TestEl(rec)
    }
}

function createTestColl(): TestColl {
    return new TestColl([
        {
            id: '1',
            w: 1,
            name: 'test1'
        },
        {
            id: '2',
            w: 2,
            name: 'test2'
        },
        {
            id: '3',
            w: 3,
            name: 'test3'
        }
    ])
}

describe('BaseCollectionTest', () => {
    it('each element should be instance of a collection element', () => {
        const testColl = createTestColl()
        assert(testColl.length === 3)
        assert(testColl._items[0] instanceof TestEl)
        assert(testColl._items[1] instanceof TestEl)
        assert(testColl._items[2] instanceof TestEl)
    })

    it('should find element', () => {
        const testColl = createTestColl()
        const item = testColl.find(el => el.id === '3')
        assert(item instanceof TestEl)
        assert(item.name === 'test3')
        assert(testColl.find(el => el.id === '3123') === undefined)
    })

    it('should get element', () => {
        const testColl = createTestColl()
        const item = testColl.get('3')
        assert(item instanceof TestEl)
        assert(item.name === 'test3')
    })

    it('should throws exception, if element not exists in collection', () => {
        const testColl = createTestColl()
        assert.throws(() => testColl.get('3333'))
    })

    it('should add element', () => {
        const testColl = createTestColl()
        const newColl = testColl.add(new TestEl({id: '4', name: 'test4'}))
        assert(newColl instanceof TestColl)
        assert(newColl.length === 4)
        assert(testColl.length === 3)
    })

    it('should remove element', () => {
        const testColl = createTestColl()
        const newColl = testColl.remove('3')
        const item = newColl.find(el => el.id === '3')
        assert(newColl instanceof TestColl)
        assert(item === undefined)
        assert(newColl.length === 2)
        assert(testColl.length === 3)
    })

    it('should soft remove element', () => {
        const testColl = createTestColl()
        const newColl = testColl.softRemove('3')
        const item = newColl.find(el => el.id === '3')
        assert(newColl instanceof TestColl)
        assert(item === undefined)
        assert(newColl.length === 2)
        assert(testColl.length === 3)
    })

    it('should soft restore element', () => {
        const testColl = createTestColl()
        const newColl = testColl.softRemove('3')
        const newColl2 = newColl.restore('3')
        const item = newColl2.get('3')
        assert(item instanceof TestEl)
        assert(newColl.length === 2)
        assert(newColl2.length === 3)
    })

    it('should throw exception if soft restore element not exists', () => {
        const testColl = createTestColl()
        assert.throws(() => testColl.restore('332'))
    })

    it('should update element', () => {
        const testColl = createTestColl()
        const newColl = testColl.update('3', el => el.copy({name: 'test4New'}))
        const item = newColl.get('3')
        assert(newColl !== testColl)
        assert(item.name === 'test4New')
    })

    it('should return same collection instance, if update element with same content', () => {
        const testColl = createTestColl()
        const newColl = testColl.update('3', el => el.copy({name: 'test3'}))
        assert(newColl === testColl)
    })

    it('should throw exception of update element not exists', () => {
        const testColl = createTestColl()
        assert.throws(() => testColl.update('4', el => el.copy({name: 'test4New'})))
    })

    it('should map collection', () => {
        const testColl = createTestColl()
        const strings = testColl.map(el => el.name)
        assert.deepEqual(strings, ['test1', 'test2', 'test3'])
    })

    it('should filter collection', () => {
        const testColl = createTestColl()
        const newColl = testColl.filter(el => el.id !== '2')
        assert(newColl instanceof TestColl)
        assert(newColl.length === 2)
        const items = newColl.map(item => item.id)
        assert.deepEqual(items, ['1', '3'])
    })

    it('should return same collection instance, if filter not found collection items', () => {
        const testColl = createTestColl()
        const newColl = testColl.filter(el => el.id !== 'not-present-id')
        assert(newColl === testColl)
    })

    it('should sort collection', () => {
        const testColl = createTestColl()
        const newColl = testColl.sort((a, b) => (a.w > b.w ? -1 : Number(a.w !== b.w)))
        assert(newColl instanceof TestColl)
        assert(newColl.length === 3)
        const items = newColl.map(item => item.id)
        assert.deepEqual(items, ['3', '2', '1'])
    })

    it('should return same collection instance, if sort not affect items order', () => {
        const testColl = createTestColl()
        const newColl = testColl.sort((a, b) => (a.w > b.w ? 1 : (-Number(a.w !== b.w))))
        assert(newColl === testColl)
    })

    it('should iterate collection', () => {
        const testColl = createTestColl()
        const items: Array<string> = [];
        // $FlowDisable
        for (const item of testColl) {
            items.push(item.id)
        }

        assert.deepEqual(items, ['1', '2', '3'])
    })
})
