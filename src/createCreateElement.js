// @flow

import type {IAtomize} from './interfaces'
import Injector from './Injector'

export default function createCreateElement<IElement, State, CreateElement: Function>(
    atomize: IAtomize<IElement, State>,
    createElement: CreateElement
): CreateElement {
    function lomCreateElement() {
        let el = arguments[0]
        let attrs: ?Object = arguments[1]
        let newEl
        const isAtomic = typeof el === 'function' && el.constructor.render === undefined
        const id = attrs ? attrs.id : undefined
        if (isAtomic) {
            if (!attrs) {
                attrs = {__lom_ctx: Injector.parentContext}
            } else {
                attrs.__lom_ctx = Injector.parentContext
            }
            if (Injector.parentContext !== undefined) {
                newEl = Injector.parentContext.alias(el, id)
                if (newEl === null) return null
                if (newEl !== undefined) el = newEl
            }

            if (el.__lom === undefined) {
                el.__lom = atomize(el)
            }
            newEl = el.__lom
        } else {
            if (Injector.parentContext !== undefined && id) {
                newEl = Injector.parentContext.alias(el, id)
                if (newEl === null) return null
                if (newEl !== undefined) el = newEl
            }
            newEl = el
        }

        switch(arguments.length) {
            case 2:
                return createElement(newEl, attrs)
            case 3:
                return createElement(newEl, attrs, arguments[2])
            case 4:
                return createElement(newEl, attrs, arguments[2], arguments[3])
            case 5:
                return createElement(newEl, attrs, arguments[2], arguments[3], arguments[4])
            case 6:
                return createElement(newEl, attrs, arguments[2], arguments[3], arguments[4], arguments[5])
            case 7:
                return createElement(newEl, attrs, arguments[2], arguments[3],
                    arguments[4], arguments[5], arguments[6])
            case 8:
                return createElement(newEl, attrs, arguments[2], arguments[3],
                    arguments[4], arguments[5], arguments[6], arguments[7])
            case 9:
                return createElement(newEl, attrs, arguments[2], arguments[3],
                    arguments[4], arguments[5], arguments[6], arguments[7], arguments[8])
            default:
                if (isAtomic === false) {
                    return createElement.apply(null, arguments)
                }
                const args = [newEl, attrs]
                for (let i = 2, l = arguments.length; i < l; i++) {
                    args.push(arguments[i])
                }
                return createElement.apply(null, args)
        }
    }

    return (lomCreateElement: any)
}
