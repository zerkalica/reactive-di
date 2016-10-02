// @flow

import {DepInfo, InternalLifeCycle, ComponentMeta} from 'reactive-di/core/common'

import type {Atom, Derivable, Adapter} from 'reactive-di/interfaces/atom'
import type {LifeCycle} from 'reactive-di/interfaces/deps'
import type {CreateElement, IComponentControllable} from 'reactive-di/interfaces/component'
import type {IContext} from 'reactive-di/interfaces/internal'

function pickFirstArg<V>(v: any[]): V {
    return v[0]
}

class ComponentLifeCycle<Component> extends InternalLifeCycle<Component> {
    _lc: LifeCycle<Component>
    _onUpdate(component: Component): void {
        if (this._lc.onUpdate) {
            this._lc.onUpdate(component, component)
        }
    }
}

export default class ComponentControllable<State: Object, Component> {
    displayName: string
    _isDisposed: Atom<boolean>
    _isMounted: Atom<boolean>
    _stateAtom: ?Derivable<State>
    _lcs: InternalLifeCycle<*>[]
    _container: IContext
    _isOwnedContainer: boolean
    _isDisposed: Atom<boolean>

    _cls: ComponentLifeCycle<*>

    constructor<V>(
        {deps, meta, ctx, name, lc}: DepInfo<V, ComponentMeta>,
        setState: (state: State) => void
    ) {
        this.displayName = name
        let container: IContext
        if (meta.register) {
            container = ctx.create(name).register(meta.register)
            this._isOwnedContainer = true
        } else {
            container = ctx
            this._isOwnedContainer = false
        }
        this._container = container
        const ad: Adapter = ctx.adapter
        this._isDisposed = ad.atom(false)
        this._isMounted = ad.atom(false)
        this._lcs = []
        this._cls = new ComponentLifeCycle(lc ? container.val(lc).get() : {})

        if (deps.length) {
            this._stateAtom = container.resolveDeps(deps, this._lcs).derive(pickFirstArg)
            this._stateAtom
                .react(setState, {
                    skipFirst: true,
                    from: this._isMounted,
                    until: this._isDisposed
                })
        }
    }

    contextify(createElement: CreateElement<*, *>): CreateElement<*, *> {
        const context: IContext = this._container
        function ce(
            tag: any,
            props?: ?{[id: string]: mixed}
        ) {
            let args: mixed[]
            switch (arguments.length) {
                /* eslint-disable prefer-rest-params */
                case 2:
                    return createElement(context.wrapComponent(tag), props)
                case 3:
                    return createElement(context.wrapComponent(tag), props, arguments[2])
                case 4:
                    return createElement(context.wrapComponent(tag), props, arguments[2],
                        arguments[3]
                    )
                case 5:
                    return createElement(context.wrapComponent(tag), props, arguments[2],
                    arguments[3], arguments[4]
                )
                case 6:
                    return createElement(context.wrapComponent(tag), props, arguments[2],
                        arguments[3], arguments[4], arguments[5]
                    )
                case 7:
                    return createElement(context.wrapComponent(tag), props, arguments[2],
                        arguments[3], arguments[4], arguments[5], arguments[6]
                    )
                case 8:
                    return createElement(context.wrapComponent(tag), props, arguments[2],
                        arguments[3], arguments[4], arguments[5], arguments[6], arguments[7]
                    )
                case 9:
                    return createElement(context.wrapComponent(tag), props, arguments[2],
                        arguments[3], arguments[4], arguments[5], arguments[6],
                        arguments[7], arguments[8]
                    )
                default:
                    args = [context.wrapComponent(tag), props]
                    for (let i = 2, l = arguments.length; i < l; i++) {
                        args.push(arguments[i])
                    }
                    return createElement(...args)
            }
        }
        ce.displayName = `h#${context.displayName}`

        return ce
    }

    getState(): ?State {
        if (this._isDisposed.get()) {
            throw new Error(`componentDidMount called after componentWillUnmount: ${this.displayName}`)
        }

        return this._stateAtom ? this._stateAtom.get() : null
    }

    onUpdate(component: Component): void {
        this._cls.onUpdate(component)
    }

    onUnmount(): void {
        const lcs = this._lcs
        for (let i = 0, l = lcs.length; i < l; i++) {
            const lc = lcs[i]
            lc.onUnmount()
        }
        this._cls.onUnmount()
        if (this._isOwnedContainer) {
            this._container.stop()
        }
        this._isDisposed.set(true)
    }

    onMount(): void {
        if (this._isDisposed.get()) {
            throw new Error(`componentDidMount called after componentWillUnmount: ${this.displayName}`)
        }
        this._isMounted.set(true)
        const lcs = this._lcs
        for (let i = 0, l = lcs.length; i < l; i++) {
            const lc = lcs[i]
            lc.onMount()
        }
        this._cls.onMount()
    }

    onWillMount(_component: Component): void {
        if (this._isDisposed.get()) {
            throw new Error(`componentDidMount called after componentWillUnmount: ${this.displayName}`)
        }
        this._isMounted.set(true)
        const lcs = this._lcs
        for (let i = 0, l = lcs.length; i < l; i++) {
            const lc = lcs[i]
            lc.onWillMount()
        }
        this._cls.onWillMount()
    }
}
if (0) ((new ComponentControllable(...(0: any))): IComponentControllable<*, *>) // eslint-disable-line
