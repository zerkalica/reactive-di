/* @flow */

import Annotations from './Annotations'
import ReactiveDi from './ReactiveDi'
import Selector from './model/Selector'
import SymbolMetaDriver from './meta/drivers/SymbolMetaDriver'
import type {Dependency} from './interfaces'

const driver = new SymbolMetaDriver()
const {factory, model, klass, setter} = new Annotations(driver)

function getDepId(obj: Object) {
    return driver.get(obj.constructor).id
}

function createDi(
    state: Object,
    registeredDeps?: Array<[Dependency, Dependency]>,
    middlewares?: Array<[Dependency, Array<Dependency>]>
): ReactiveDi {
    const selector = new Selector(state, getDepId)

    const reactiveDi = new ReactiveDi(
        driver,
        selector,
        registeredDeps,
        middlewares
    )

    return reactiveDi
}

export {factory, model, klass, setter, createDi}
