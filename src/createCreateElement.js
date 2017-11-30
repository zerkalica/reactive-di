// @flow

import type {IAtomize} from './interfaces'
import Injector from './Injector'

export default function createCreateElement<IElement, State, CreateElement: Function>(
    atomize: IAtomize<IElement, State>,
    createElement: CreateElement,
    compositeId?: boolean
): CreateElement {
    let parentId = ''
    function lomCreateElement() {
        const args = arguments
        let attrs = args[1]
        let el = args[0]
        let newEl
        const isAtomic = typeof el === 'function' && el.constructor.render === undefined
        let id: string | void = attrs ? attrs._id || attrs.id : undefined
        const parentContext: Injector = Injector.parentContext

        const oldParentId = parentId
        if (compositeId === true) {
            if(!attrs) attrs = {}
            attrs.id = parentContext.toString()
            if (id) attrs.id += '.' + id
            parentId = attrs.id
        }

        if (isAtomic) {
            newEl = parentContext.alias(el, id)
            if (newEl === null) {
                parentId = oldParentId
                return null
            }
            if (newEl !== undefined) el = newEl
            if (!attrs) {
                attrs = {__lom_ctx: parentContext}
            } else {
                attrs.__lom_ctx = parentContext
            }

            if (el.__lom === undefined) {
                el.__lom = atomize(el)
            }
            newEl = el.__lom
        } else {
            if (id) {
                newEl = parentContext.alias(el, id)
                if (newEl === null) {
                    parentId = oldParentId
                    return null
                }
                if (newEl !== undefined) el = newEl
            }
            newEl = el
        }
        let result: mixed
        switch(args.length) {
            case 2:
                result = createElement(newEl, attrs);break
            case 3:
                result = createElement(newEl, attrs, args[2]);break
            case 4:
                result = createElement(newEl, attrs, args[2], args[3]);break
            case 5:
                result = createElement(newEl, attrs, args[2], args[3], args[4]);break
            case 6:
                result = createElement(newEl, attrs, args[2], args[3], args[4], args[5]);break
            case 7:
                result = createElement(newEl, attrs, args[2], args[3],
                    args[4], args[5], args[6]);break
            case 8:
                result = createElement(newEl, attrs, args[2], args[3],
                    args[4], args[5], args[6], args[7]);break
            case 9:
                result = createElement(newEl, attrs, args[2], args[3],
                    args[4], args[5], args[6], args[7], args[8]);break
            default:
                if (isAtomic === false) {
                    result = createElement.apply(null, args)
                } else {
                    const newArgs = [newEl, attrs]
                    for (let i = 2, l = args.length; i < l; i++) {
                        newArgs.push(args[i])
                    }
                    result = createElement.apply(null, newArgs)
                }
        }

        parentId = oldParentId
        return result
    }

    return (lomCreateElement: any)
}
