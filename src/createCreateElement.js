// @flow

import type {IAtomize} from './interfaces'
import Injector from './Injector'

export default function createCreateElement<IElement, State, CreateElement: Function>(
    atomize: IAtomize<IElement, State>,
    createElement: CreateElement,
    modifyId?: boolean
): CreateElement {
    function lomCreateElement() {
        const args = arguments
        let attrs = args[1]
        let el = args[0]
        let newEl
        const isAtomic = typeof el === 'function' && el.constructor.render === undefined
        const parentContext: Injector = Injector.parentContext
        const props = parentContext.props

        let id: string | void = undefined

        if (attrs) {
            const pid = parentContext.id
            id = attrs.rdi_id || attrs.id
            if (attrs.rdi_theme === true) {
                attrs.rdi_theme = undefined
                if (props) {
                    const cls = props.class
                    if (cls !== undefined) {
                        attrs.class = attrs.class !== undefined ? (attrs.class + ' ' + cls) : cls
                    }
                    const style = props.style
                    if (style !== undefined) {
                        const aStyle = attrs.style
                        if (aStyle) {
                            for (let key in style) {
                                aStyle[key] = style[key]
                            }
                        } else attrs.style = style
                    }
                }
                if (modifyId) attrs.id = pid
            } else if (modifyId && pid !== '' && attrs.id !== undefined) {
                attrs.id = pid + '.' + attrs.id
            }
        }

        if (isAtomic) {
            newEl = parentContext.alias(el, id)
            if (newEl === null) return null
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
                if (newEl === null) return null
                if (newEl !== undefined) el = newEl
            }
            newEl = el
        }
        switch(args.length) {
            case 2:
                return createElement(newEl, attrs)
            case 3:
                return createElement(newEl, attrs, args[2])
            case 4:
                return createElement(newEl, attrs, args[2], args[3])
            case 5:
                return createElement(newEl, attrs, args[2], args[3], args[4])
            case 6:
                return createElement(newEl, attrs, args[2], args[3], args[4], args[5])
            case 7:
                return createElement(newEl, attrs, args[2], args[3],
                    args[4], args[5], args[6])
            case 8:
                return createElement(newEl, attrs, args[2], args[3],
                    args[4], args[5], args[6], args[7])
            case 9:
                return createElement(newEl, attrs, args[2], args[3],
                    args[4], args[5], args[6], args[7], args[8])
            default:
                if (isAtomic === false) {
                    return createElement.apply(null, args)
                } else {
                    const newArgs = [newEl, attrs]
                    for (let i = 2, l = args.length; i < l; i++) {
                        newArgs.push(args[i])
                    }
                    return createElement.apply(null, newArgs)
                }
        }
    }

    return (lomCreateElement: any)
}
