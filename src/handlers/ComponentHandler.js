//@flow

import {DepInfo, InternalLifeCycle, ComponentMeta, IContext, IHandler} from 'reactive-di/common'
import type {RdiMeta} from 'reactive-di/common'
import type {Atom, Derivable, CacheMap, Adapter} from 'reactive-di/interfaces/atom'
import type {LifeCycle, ArgDep} from 'reactive-di/interfaces/deps'
import type {
    CreateControllable,
    IComponentControllable,
    CreateWidget,
    RawStyleSheet,
    CreateElement
} from 'reactive-di/interfaces/component'
import shallowEqual from 'reactive-di/utils/shallowEqual'

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

class ComponentControllable<State: Object> {
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
        setState: (state: State) => void,
        component: mixed
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
            const internalLc = new ComponentLifeCycle(container.val(lc).get())
            this._lcs.push(internalLc)
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

    wrapElement: (tag: Function) => Function = (tag: Function) => this._container.val(tag).get()

    getState(): ?State {
        if (this._stopped) {
            throw new Error(`componentDidMount called after componentWillUnmount: ${this.displayName}`)
        }

        return this._stateAtom ? this._stateAtom.get() : null
    }

    onUpdate(): void {
        const lcs = this._lcs
        for (let i = 0, l = lcs.length; i < l; i++) {
            const lc = lcs[i]
            lc.onUpdate()
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
if (0) ((new ComponentControllable(...(0: any))): IComponentControllable<*>)

export default class ComponentHandler {
    _componentCache: CacheMap = new Map()
    _createComponent: CreateWidget<*, *, *>

    constructor(
        createComponent: CreateWidget<*, *, *>
    ) {
        this._createComponent = createComponent
    }

    handle<V>(depInfo: DepInfo<V, ComponentMeta>): Atom<V> {
        let atom: ?Atom<V> = this._componentCache.get(depInfo.key)
        if (atom) {
            return atom
        }

        function createControllable<State, Component: Object>(
            setState: (state: State) => void,
            component: mixed
        ): IComponentControllable<State> {
            return new ComponentControllable(depInfo, setState, component)
        }

        atom = depInfo.ctx.adapter.atom((this._createComponent(
            depInfo.target,
            (createControllable: CreateControllable<*>)
        ): any))

        this._componentCache.set(depInfo.key, atom)

        return atom
    }

    postHandle(): void {}
}

if (0) ((new ComponentHandler(...(0: any))): IHandler)
