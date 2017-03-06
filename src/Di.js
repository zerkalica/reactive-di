// @flow

import type {ICacheItem, IStaticContext, IContext, IRelationBinder} from './commonInterfaces'

import type {INotifier} from './hook/interfaces'

import type {IControllable, ISource, IStatus} from './source/interfaces'
import Source from './source/Source'
import Status from './source/Status'

import type {IComputed} from './computed/interfaces'
import Computed from './computed/Computed'

import type {IComponentFactory, IComponent, IConsumerFactory} from './consumer/interfaces'
import ConsumerFactory from './consumer/ConsumerFactory'

import DisposableCollection from './utils/DisposableCollection'
import type {IDisposableCollection, IHasDispose} from './utils/DisposableCollection'
import type {IArg} from './utils/resolveArgs'

import type {IRawArg, IDepRegister} from './interfaces'

export default class Di<Component, Element> {
    displayName: string

    defaultErrorComponent: Component
    componentFactory: IComponentFactory<Component, Element>
    protoFactory: ?IContext
    binder: IRelationBinder
    notifier: INotifier
    closed: boolean
    disposables: IDisposableCollection<IHasDispose>
    items: ICacheItem[]

    Updater: Class<IControllable>;

    _parents: IContext[]
    _context: IStaticContext<Component, Element>

    constructor(
        displayName: string,
        items: ICacheItem[],
        c: IStaticContext<Component, Element>,
        parents: IContext[]
    ) {
        this.displayName = displayName
        this.items = items
        this.componentFactory = c.componentFactory
        this.protoFactory = c.protoFactory
        this.binder = c.binder
        this.Updater = c.Updater
        this.notifier = c.notifier
        this.defaultErrorComponent = c.defaultErrorComponent
        this._context = c
        this.disposables = new DisposableCollection()
        this._parents = parents
        for (let i = 0, l = parents.length; i < l; i++) {
            parents[i].disposables.push(this)
        }
        this.closed = false
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

    copy(displayName: string): this {
        const newParents = this._parents.slice(0)
        newParents.push(this)

        return (new Di(
            displayName,
            this.items.slice(0),
            this._context,
            newParents
        ): any)
    }

    _any<V: Object>(
        k: Function,
        context: IContext
    ): ISource<V> | IComputed<V> | IStatus<V> | IConsumerFactory<V, Element, Component> {
        if (k._rdiKey) {
            return new Source(k, context)
        } else if (k.statuses) {
            return new Status(k, context)
        } else if (k._rdiJsx) {
            return new ConsumerFactory(k, context)
        }

        return new Computed(k, context)
    }

    register(registered?: ?IDepRegister[]): this {
        if (!registered) {
            return this
        }
        const items = this.items
        let rec: ?ICacheItem

        for (let i = 0, l = registered.length; i < l; i++) {
            const pr: IDepRegister = registered[i]
            if (Array.isArray(pr)) {
                if (pr.length !== 2) {
                    throw new Error(`Provide tuple of two items in register() ${this.binder.debugStr(pr)}`)
                }
                if (typeof pr[1] !== 'function') {
                    throw new Error(`Only function as register target, given: ${this.binder.debugStr(pr[1])}`)
                }
                const [key, target] = pr

                rec = items[target._rdiId || 0]

                // @todo expose resolved
                if (rec && rec.resolved) {
                    const binder = this.binder
                    const fromTo = `Can't create alias from ${binder.debugStr(key)} to ${binder.debugStr(target)}`
                    throw new Error(`Target dependency already initialized. ${fromTo}`)
                }
                const depInfo = this._any(
                    target,
                    rec ? rec.context : this
                )
                items[depInfo.id] = depInfo
                key._rdiJsx = target._rdiJsx

                if (key._rdiId) {
                    const binder = this.binder
                    const fromTo = `Can't create alias from ${binder.debugStr(key)} to ${binder.debugStr(target)}`
                    throw new Error(`Aliased dependency already resolved. ${fromTo}`)
                }
                key._rdiId = depInfo.id // eslint-disable-line
            } else {
                if (typeof pr !== 'function') {
                    throw new Error(`Only function as register target, given: ${this.binder.debugStr(pr)}`)
                }
                if (!items[pr._rdiId || 0]) {
                    rec = this._any(pr, this)
                    items[rec.id] = rec
                }
            }
        }

        return this
    }

    resolveConsumer<Props: Object>(key: Function): IConsumerFactory<Props, Element, Component> {
        const rec: IConsumerFactory<Props, Element, Component> = new ConsumerFactory(key, this)
        this.items[rec.id] = rec
        return rec
    }

    wrapComponent<Props: Object, State: Object>(tag: IComponent<Props, State, Element>): Component {
        return ((this.items[tag._rdiId || 0]: any) || this.resolveConsumer(tag)).component
    }

    resolveSource<V: Object>(key: Function): ISource<V> {
        let rec: ?ISource<V> = (this.items[key._rdiId || 0]: any)
        if (!rec) {
            rec = new Source(key, this)
            this.items[rec.id] = rec
        }
        rec.resolve()

        return rec
    }

    _anyDep<V: Object>(
        k: Function
    ): ISource<V> | IComputed<V> | IStatus<V> {
        if (k._rdiKey) {
            return new Source(k, this)
        } else if (k.statuses) {
            return new Status(k, this)
        } else if (k._rdiAbs) {
            throw new Error(`Need register Abstract entity ${this.binder.debugStr(k)}`)
        }

        return new Computed(k, this)
    }

    resolveDeps(argDeps: IRawArg[]): IArg[] {
        const items = this.items
        const resolvedArgs: IArg[] = []
        let rec: ?ISource<*> | IComputed<*> | IStatus<*>
        for (let i = 0, l = argDeps.length; i < l; i++) {
            const argDep = argDeps[i]
            if (typeof argDep === 'object') {
                const values = []
                for (let prop in argDep) { // eslint-disable-line
                    const key = argDep[prop]
                    rec = (items[key._rdiId || 0]: any)
                    if (!rec) {
                        rec = this._anyDep(key)
                        items[rec.id] = rec
                    }
                    rec.resolve()

                    values.push({k: prop, v: rec})
                }
                resolvedArgs.push({t: 1, v: values})
            } else {
                rec = (items[argDep._rdiId || 0]: any)
                if (!rec) {
                    rec = this._anyDep(argDep)
                    items[rec.id] = rec
                }
                rec.resolve()

                resolvedArgs.push({t: 0, v: rec})
            }
        }

        return resolvedArgs
    }
}
