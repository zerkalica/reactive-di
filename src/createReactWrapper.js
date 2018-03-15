// @flow
import {createConnect, CatchableComponent} from 'urc'
import type {IReactHost, IReactAtom, IRenderError, ErrorProps} from 'urc'
import Injector from './Injector'
import type {IRenderFn} from './interfaces'

export default function createReactWrapper<IElement>(
    BaseComponent: Class<*>,
    renderError: IRenderError<IElement, *>,
    ReactAtom: Class<IReactAtom<IElement>>,
    rootInjector?: Injector = new Injector(),
) {
    const names: Map<string, number> = new Map()
    function normalizeClass(cls: {displayName: string}) {
        let prefix = names.get(cls.displayName)
        if (prefix !== undefined) {
            prefix++
            names.set(cls.displayName, prefix)
            cls.displayName = cls.displayName + prefix
        } else {
            names.set(cls.displayName, 0)
        }

        return cls
    }

    class MixinComponent<Props: Object, State, Context> extends CatchableComponent<Props, State, Context, IElement> {
        _injector: Injector
        static instance: number
        props: Props
        componentWillMount() {
            super.componentWillMount()
            const cns: Function = this.constructor
            if (cns.instance === undefined) {
                cns.instance = 0
                cns.isDynamic = false
            }

            cns.instance++

            let injector: Injector = rootInjector
            const props = this.props
            if (props && props.__lom_ctx !== undefined) injector = props.__lom_ctx
            this._injector = injector.copy(cns)
            this._injector.id = cns.displayName
            this._injector.props = props
        }

        componentWillUnmount() {
            this.constructor.instance--
            this._injector.destructor()
            super.componentWillUnmount()
        }

        __value(isPropsChanged: boolean) {
            const oldInjector = Injector.parentContext
            Injector.parentContext = this._injector
            const value = super.__value(isPropsChanged)
            Injector.parentContext = oldInjector
            return value
        }

        _getContext(key: Function, propsChanged: boolean): Context {
            return this._injector.getContext(key, propsChanged ? this.props : undefined)
        }
    }

    return ((createConnect({
        ReactAtom,
        renderError,
        BaseComponent,
        MixinComponent,
        normalizeClass
    }): any): IRenderFn<*, *>)
}
