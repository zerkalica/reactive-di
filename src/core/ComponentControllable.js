//@flow

import shallowEqual from 'reactive-di/utils/shallowEqual'

import {DepInfo, InternalLifeCycle, ComponentMeta} from 'reactive-di/core/common'

import type {Atom, Derivable, Adapter} from 'reactive-di/interfaces/atom'
import type {Key, LifeCycle} from 'reactive-di/interfaces/deps'
import type {SrcComponent, IComponentControllable} from 'reactive-di/interfaces/component'
import type {IContext} from 'reactive-di/interfaces/internal'

function pickFirstArg<V>(v: any[]): V {
    return v[0]
}

function createSetState<State: Object>(
    setState: (state: State) => void
): (state: State) => void {
    let oldState: State = ({}: any)
    return function equalSetState(state: State): void {
        if (!shallowEqual(oldState, state)) {
            oldState = state
            setState(state)
        }
    }
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
    _stopped: boolean = false

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
        const isDisposed: Atom<boolean> = ctx.stopped
        this._isMounted = ad.atom(false)
        this._lcs = []

        if (lc) {
            this._lcs.push(new ComponentLifeCycle(container.val(lc).get()))
        }

        if (deps.length) {
            this._stateAtom = container.resolveDeps(deps, this._lcs).derive(pickFirstArg)
            this._stateAtom
                .react(createSetState(setState), {
                    skipFirst: true,
                    from: this._isMounted,
                    while: this._isMounted,
                    until: (isDisposed: Derivable<boolean>)
                })
        }
    }

    wrapComponent: (tag: SrcComponent<*, State>) => Component = (
        tag: SrcComponent<*, State>
    )=> this._container.wrapComponent(tag)

    getState(): ?State {
        if (this._stopped) {
            throw new Error(`componentDidMount called after componentWillUnmount: ${this.displayName}`)
        }

        return this._stateAtom ? this._stateAtom.get() : null
    }

    onUpdate(component: Component): void {
        const lcs = this._lcs
        for (let i = 0, l = lcs.length; i < l; i++) {
            const lc = lcs[i]
            lc.onUpdate(component)
        }
    }

    onUnmount(): void {
        this._isMounted.set(false)
        const lcs = this._lcs
        for (let i = 0, l = lcs.length; i < l; i++) {
            const lc = lcs[i]
            lc.onUnmount()
        }
        if (this._isOwnedContainer) {
            this._container.stop()
        }
        this._stopped = true
    }

    onMount(): void {
        if (this._stopped) {
            throw new Error(`componentDidMount called after componentWillUnmount: ${this.displayName}`)
        }
        this._isMounted.set(true)
        const lcs = this._lcs
        for (let i = 0, l = lcs.length; i < l; i++) {
            const lc = lcs[i]
            lc.onMount()
        }
    }
}
if (0) ((new ComponentControllable(...(0: any))): IComponentControllable<*, *>)
