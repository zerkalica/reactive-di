//@flow

import {DepInfo, InternalLifeCycle, ComponentMeta, IContext, IHandler} from 'reactive-di/common'
import type {RdiMeta} from 'reactive-di/common'
import type {Atom, Derivable, CacheMap, Adapter} from 'reactive-di/interfaces/atom'
import type {ArgDep} from 'reactive-di/interfaces/deps'
import type {
    CreateControllable,
    IComponentControllable,
    CreateWidget,
    RawStyleSheet
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

class ComponentControllable<State: Object> {
    displayName: string
    _isDisposed: Atom<boolean>
    _isMounted: Atom<boolean>
    _stateAtom: ?Derivable<State>
    _lcs: InternalLifeCycle<*>[]
    _container: ?IContext
    _stopped: boolean = false

    constructor<V>(
        {deps, meta, ctx, name}: DepInfo<V, ComponentMeta>,
        setState: (state: State) => void
    ) {
        this.displayName = name
        let container: IContext
        if (meta.register) {
            container = ctx.create(name).register(meta.register)
            this._container = container
        } else {
            container = ctx
            this._container = null
        }

        const ad: Adapter = ctx.adapter
        const isDisposed: Atom<boolean> = ctx.stopped
        this._isMounted = ad.atom(false)

        this._lcs = []
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

    getState(): ?State {
        if (this._stopped) {
            throw new Error(`componentDidMount called after componentWillUnmount: ${this.displayName}`)
        }

        return this._stateAtom ? this._stateAtom.get() : null
    }

    onUnmount(): void {
        this._isMounted.set(false)
        const lcs = this._lcs
        for (let i = 0, l = lcs.length; i < l; i++) {
            const lc = lcs[i]
            if (!lc.isDisposed) {
                lc.onUnmount()
            }
        }
        if (this._container) {
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
            if (!lc.isDisposed) {
                lc.onMount()
            }
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

        function createControllable<State>(
            setState: (state: State) => void
        ): IComponentControllable<State> {
            return new ComponentControllable(depInfo, setState)
        }

        atom = depInfo.ctx.adapter.atom(this._createComponent(
            depInfo.target,
            (createControllable: CreateControllable<*>)
        ))

        this._componentCache.set(depInfo.key, atom)

        return atom
    }

    postHandle(): void {}
}

if (0) ((new ComponentHandler(...(0: any))): IHandler)
