/* eslint-env mocha */
/* @flow */

import assert from 'power-assert'
import EntityMeta, {updateMeta} from '../EntityMeta'

describe('EntityMetaTest', () => {
    it('should create with default props', () => {
        const meta = new EntityMeta()
        assert.deepEqual(meta, {
            pending: false,
            rejected: false,
            fulfilled: true,
            reason: null
        })
    })

    it('should create copy, if changed prop', () => {
        const meta1 = new EntityMeta({
            pending: true
        })

        const meta2 = meta1.copy({
            rejected: true
        })

        assert(meta2 !== meta1)
        assert(meta1.pending === meta2.pending === true)
        assert(meta2.rejected === true !== meta1.rejected)
    })

    it('shoud return same instance, if not changed properties', () => {
        const meta1 = new EntityMeta({
            pending: true
        })

        const meta2 = meta1.copy({
            rejected: false
        })
        assert(meta2 === meta1)
    })

    it('should combine multiple metas', () => {
        const meta1 = new EntityMeta({
            fulfilled: true,
            rejected: true,
            pending: false,
            reason: null
        })
        const a: EntityMeta = new EntityMeta({pending: true, fulfilled: false});
        const b: EntityMeta = new EntityMeta({rejected: false, fulfilled: false});
        const c: EntityMeta = new EntityMeta({fulfilled: false});
        const meta2 = meta1.copy()
        updateMeta(meta2, a)
        updateMeta(meta2, b)
        updateMeta(meta2, c)

        assert(meta2.rejected === true)
        assert(meta2.pending === true)
        assert(meta2.fulfilled === false)
    })
})
