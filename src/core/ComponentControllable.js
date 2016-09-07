//@flow

import {DepInfo, InternalLifeCycle, ComponentMeta} from 'reactive-di/core/common'

import type {Atom, Derivable, Adapter} from 'reactive-di/interfaces/atom'
import type {Key, LifeCycle} from 'reactive-di/interfaces/deps'
import type {CreateElement, SrcComponent, IComponentControllable} from 'reactive-di/interfaces/component'
import type {IContext} from 'reactive-di/interfaces/internal'

function pickFirstArg<V>(v: any[]): V {
    return v[0]
}

class ComponentLifeCycle<Component> extends InternalLifeCycle<Component> {
    _lc: LifeCycle<Component>
    _onUpdate(component: Component): void {
        this._lc.onUpdate && this._lc.onUpdate(component, component)
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

    createElement: CreateElement<Component, *>
    _cls: ComponentLifeCycle<*>
    constructor<V>(
        {deps, meta, ctx, name, lc}: DepInfo<V, ComponentMeta>,
        setState: (state: State) => void,
        createElement: CreateElement<Component, *>
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
        this.createElement = createElement
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
}
if (0) ((new ComponentControllable(...(0: any))): IComponentControllable<*, *>)
