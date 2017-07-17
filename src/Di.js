// @flow

import type {IStaticContext, IContext} from './commonInterfaces'

import type {INotifier, ISource, IRelationBinder} from './source/interfaces'
import Source from './source/Source'
import Status from './source/Status'

import Computed from './computed/Computed'
import ConsumerFactory from './consumer/ConsumerFactory'
import type {ICreateComponent} from './consumer/interfaces'

import DisposableCollection from './utils/DisposableCollection'
import type {IDisposableCollection, IHasDispose} from './utils/DisposableCollection'
import type {IArg} from './computed/resolveArgs'

import type {IRawArg, IDepRegister} from './interfaces'

class A {
    a: number = 1
}

class B {
    // b: string = '2'
    a = '1'
}

type Obj<V> = { [key: $Keys<V>]: mixed }

// type $Object<V> = {+[key: string]: V}
// type _$Values<V, O: $Object<V>> = V// eslint-disable-line
// type $Values<O: Object> = _$Values<*, O>
//
// type Obj<V: Object> = {+[key: string]: $Values<V>}
//
function src<V: Object>(o: Obj<V>): (newO: $Shape<V>) => any {
    return (newO: $Shape<V>) => (
        {
            ...o,
            ...newO
        }
    )
}
const set = src(new A())
set(new B())

// function cloneObject<T: { [key: string]: mixed }>(obj: T): $Shape<T> {
//     return (obj: any)
// }
//
// cloneObject(new A()).w = 2

import type {
    CreateVNode,
    VNodeFlags,
    Ref,
    InfernoChildren,
    Type,
    VNode,
    Props
} from './adapters/inferno'

type ICacheItem = Object

interface IAliasedDep {
    id: number;
    context: IContext;
}

interface IGettableResolvable<V> extends IAliasedDep {
    cached: ?V;
    get(): V;
    resolve(binder: IRelationBinder): void;
}

interface IResolvableSource<V: Object, M> extends ISource<V, M> {
    resolve(binder: IRelationBinder): void;
}

export default class Di implements IContext {
    displayName: string

    protoFactory: ?IContext
    notifier: INotifier
    closed: boolean = false
    disposables: IDisposableCollection<IHasDispose> = new DisposableCollection()
    values: {[id: string]: any}
    binder: IRelationBinder
    createComponent: ICreateComponent

    _items: ICacheItem[]
    _parents: IContext[]
    _context: IStaticContext
    _createVNode: CreateVNode

    constructor(
        displayName: string,
        items: ICacheItem[],
        c: IStaticContext,
        parents: IContext[]
    ) {
        this.displayName = displayName
        this._items = items
        this.protoFactory = c.protoFactory
        this.binder = c.binder
        this.values = c.values
        this.notifier = c.notifier
        this.createComponent = c.createComponent

        this._createVNode = c.createVNode
        this._context = c
        this._parents = parents
        for (let i = 0, l = parents.length; i < l; i++) {
            parents[i].disposables.push(this)
        }
    }

    dispose(): void {
        this.closed = true
        const disposables = this.disposables.items
        for (let i = 0, l = disposables.length; i < l; i++) {
            const disposable = disposables[i]
            if (!disposable.closed) {
                disposable.dispose()
            }
        }
        this.disposables.items = []
    }

    copy(displayName: string): IContext {
        const newParents = this._parents.slice(0)
        newParents.push(this)

        return new Di(
            displayName,
            this._items.slice(0),
            this._context,
            newParents
        )
    }

    register(registered?: ?IDepRegister[]): this {
        if (!registered) {
            return this
        }
        const items = this._items
        let rec: ?ICacheItem
        const binder = this.binder

        for (let i = 0, l = registered.length; i < l; i++) {
            const pr: IDepRegister = registered[i]
            if (Array.isArray(pr)) {
                if (pr.length !== 2) {
                    throw new Error(`Provide tuple of two items in register() ${binder.debugStr(pr)}`)
                }
                if (typeof pr[1] !== 'function') {
                    throw new Error(`Only function as register target, given: ${binder.debugStr(pr[1])}`)
                }
                const [key, target] = pr

                rec = items[target._r0 || 0]

                // @todo expose resolved
                if (rec && rec.resolved) {
                    const fromTo = `Can't create alias from ${binder.debugStr(key)} to ${binder.debugStr(target)}`
                    throw new Error(`Target dependency already initialized. ${fromTo}`)
                }
                const depInfo = this._any(
                    target,
                    rec ? rec.context : this
                )
                items[depInfo.id] = depInfo
                key._r2 = target._r2
                // @todo bug here
                key._r0 = depInfo.id // eslint-disable-line
            } else {
                if (typeof pr !== 'function') {
                    throw new Error(`Only function as register target, given: ${binder.debugStr(pr)}`)
                }
                if (!items[pr._r0 || 0]) {
                    rec = this._any(pr, this)
                    items[rec.id] = rec
                }
            }
        }

        return this
    }

    h(
        flags: VNodeFlags,
        type?: Type,
        className?: string,
        children?: InfernoChildren,
        props?: Props,
        key?: any,
        ref?: Ref,
        noNormalise?: boolean
    ): VNode {
        /* eslint-disable no-bitwise */
        if ((flags & 16) && ((type: any)._r2 & 1)) {
            let factory: ?ConsumerFactory<*, *, *> = (type: any)._r0
                ? this._items[(type: any)._r0]
                : null

            if (!factory) {
                factory = new ConsumerFactory((type: any), this)
                this._items[factory.id] = factory
            }
            props = (props || {}: Object)
            props._rdi = factory.create(this.notifier.parentId)
            type = factory.component
        }

        return this._createVNode(flags, type, className, children, props, key, ref, noNormalise)
    }

    resolveSource<V: Object, M>(key: Function): ISource<V, M> {
        let rec: ?IResolvableSource<V, M> = (this._items[key._r0 || 0]: any)
        if (!rec) {
            rec = new Source(key, this)
            this._items[rec.id] = rec
        }
        rec.resolve(this.binder)

        return rec
    }

    _any(
        k: Function,
        context: IContext
    ): IAliasedDep {
        if (k.statuses) {
            return new Status(k, context)
        } else if (k._r2 & 1) {
            return new ConsumerFactory(k, context)
        } else if ((k._r2 & (128 + 64)) || (!k._r1 && !(k._r2 & 8) && !(k._r2 & 16))) {
            return new Source(k, context)
        }

        return new Computed(k, context)
    }

    _anyDep(
        k: Function
    ): IGettableResolvable<*> {
        if (k.statuses) {
            return new Status(k, this)
        } else if ((k._r2 & (128 + 64)) || (!k._r1 && !(k._r2 & 8) && !(k._r2 & 16))) {
            return new Source(k, this)
        } else if (k._r2 & 32) {
            throw new Error(`Need register Abstract entity ${this.binder.debugStr(k)}`)
        }

        return new Computed(k, this)
    }

    resolveDeps(argDeps: IRawArg[]): IArg[] {
        const items = this._items
        const resolvedArgs: IArg[] = []
        const binder = this.binder
        let rec: ?IGettableResolvable<*>
        for (let i = 0, l = argDeps.length; i < l; i++) {
            let argDep = argDeps[i]
            let asSrc = false
            if (typeof argDep === 'object') {
                const values = []
                for (let prop in argDep) { // eslint-disable-line
                    let key = argDep[prop]
                    if (key._r4) {
                        asSrc = true
                        // @todo accept arrays
                        key = key.v[0]
                    }

                    rec = (items[key._r0 || 0]: any)
                    if (!rec) {
                        rec = this._anyDep(key)
                        items[rec.id] = rec
                    }
                    rec.resolve(binder)

                    values.push({k: prop, v: rec, asSrc})
                }
                resolvedArgs.push({t: 1, v: values})
            } else {
                if (argDep._r4) {
                    asSrc = true
                    // @todo accept arrays
                    argDep = argDep.v[0]
                }
                rec = (items[argDep._r0 || 0]: any)
                if (!rec) {
                    rec = this._anyDep(argDep)
                    items[rec.id] = rec
                }
                rec.resolve(binder)

                resolvedArgs.push({t: 0, v: rec, asSrc})
            }
        }

        return resolvedArgs
    }
}
