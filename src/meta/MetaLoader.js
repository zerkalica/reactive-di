/* @flow */

import AbstractMetaDriver from './drivers/AbstractMetaDriver'
import DepMeta from './DepMeta'
import type {Dependency, DepId} from '../interfaces'

export default class MetaLoader {
    _cachedMeta: {[id: DepId]: DepMeta};
    _driver: AbstractMetaDriver;

    constructor(
        driver: AbstractMetaDriver,
        aliases?: Array<[Dependency, Dependency]>
    ) {
        this._cachedMeta = Object.create(null)
        this._driver = driver

        ;(aliases || []).forEach(([depSrc, depTarget]) => {
            this._cachedMeta[driver.get(depSrc).id] = driver.get(depTarget)
        })
    }

    get(dep: Dependency): DepMeta {
        const depMeta = this._driver.get(dep)
        return this._cachedMeta[depMeta.id] || depMeta
    }
}
