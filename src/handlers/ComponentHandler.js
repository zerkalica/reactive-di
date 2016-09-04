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

function createLcsNotifier(lcs: InternalLifeCycle<*>[]): (isMounted: boolean) => void {
    return function notifyLcs(isMounted: boolean): void {
        if (isMounted) {
            for (let i = 0, l = lcs.length; i < l; i++) {
                lcs[i].onMount()
            }
        } else {
            for (let i = 0, l = lcs.length; i < l; i++) {
                lcs[i].onUnmount()
            }
        }
    }
}

class ComponentControllable<State: Object> {
    _isDisposed: Atom<boolean>
    _isMounted: Atom<boolean>
    _stateAtom: ?Derivable<State>

    constructor<V>(
        {deps, meta, ctx, name}: DepInfo<V, ComponentMeta>,
        setState: (state: State) => void
    ) {
        const container: IContext = meta.register
            ? ctx.create(name).register(meta.register)
            : ctx
        const ad: Adapter = ctx.adapter
        const isDisposed: Atom<boolean> = ad.atom(false)
        this._isMounted = ad.atom(false)

        const lcs: InternalLifeCycle<*>[] = []
        if (deps.length) {
            this._stateAtom = container.resolveDeps(deps, lcs).derive(pickFirstArg)
            this._stateAtom
                .react(createSetState(setState), {
                    skipFirst: true,
                    from: this._isMounted,
                    while: this._isMounted,
                    until: (isDisposed: Derivable<boolean>)
                })
        }

        if (lcs.length) {
            this._isMounted.react(createLcsNotifier(lcs), {
                skipFirst: true,
                until: (isDisposed: Derivable<boolean>)
            })
        }
    }

    getState(): State {
        return this._stateAtom ? this._stateAtom.get() : ({}: any)
    }

    onUnmount(): void {
        this._isMounted.set(false)
    }

    onMount(): void {
        this._isMounted.set(true)
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
