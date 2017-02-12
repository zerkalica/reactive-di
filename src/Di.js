// @flow

import type {
    IDepFactory,
    IComponentFactory,
    IContext,
    IRelationBinder,
    INotifier,
    IHasDispose,
    IKey,
    IRawArg,
    IArg,
    IDepRegister,
    ISource,
    IStatus,
    IComputed,
    IConsumerFactory,
    IDisposableCollection,
    IStaticContext,
    IComponent,
    ICacheItem
} from './atoms/interfaces'

import DisposableCollection from './atoms/DisposableCollection'

declare class Reflect {
    static getMetadata<V>(key: string, target: Function): V;
}

const emptyCached: any = {
    cached: {}
}

export default class Di<Component, Element> {
    displayName: string

    componentFactory: IComponentFactory<Component, Element>
    protoFactory: ?IContext
    binder: IRelationBinder
    notifier: INotifier
    closed: boolean
    disposables: IDisposableCollection<IHasDispose>

    _parents: IContext[]
    _depFactory: IDepFactory<Element>
    items: ICacheItem[]
    _context: IStaticContext<Component, Element>

    constructor(
        displayName: string,
        items: ICacheItem[],
        c: IStaticContext<Component, Element>,
        parents: IContext[]
    ) {
        this.displayName = displayName
        this.items = items
        this._depFactory = c.depFactory
        this.componentFactory = c.componentFactory
        this.protoFactory = c.protoFactory
        this.binder = c.binder
        this.notifier = c.notifier
        this._context = c
        this.disposables = new DisposableCollection()
        this._parents = parents
        for (let i = 0, l = parents.length; i < l; i++) {
            parents[i].disposables.push(this)
        }
        if (c.contexts) {
            c.contexts.push(this)
        }
        this.closed = false
    }

    dispose(): void {
        this.closed = true
        const disposables = this.disposables.items
        for (let i = 0, l = disposables.length; i < l; i++) {
            const disposable = disposables[i]
            if (!disposable.closed) {
                disposable.closed = true
                disposable.dispose()
            }
        }
        this.disposables.items = []
    }

    set<V>(id: number, v: V): boolean {
        const rec = this.items[id]
        if (rec) {
            (rec: any).set(v)
            return true
        }

        return false
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

    register(registered?: ?IDepRegister[]): this {
        if (!registered) {
            return this
        }
        const items = this.items
        const df = this._depFactory
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
                const depInfo = df.any(
                    target,
                    rec ? rec.context : this
                )
                items[depInfo.id] = depInfo

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
                    rec = df.any(pr, this)
                    items[rec.id] = rec
                }
            }
        }

        return this
    }

    resolveConsumer<V: Object>(key: IKey): IConsumerFactory<V, Element> {
        const rec: IConsumerFactory<V, Element> = this._depFactory.consumer(key, this)
        this.items[rec.id] = rec
        return rec
    }

    wrapComponent<Props, State>(tag: IComponent<Props, State, Element>): Component {
        return ((this.items[tag._rdiId || 0]: any) || this.resolveConsumer(tag)).component
    }

    resolveSource<V>(key: IKey): ISource<V> {
        let rec: ?ISource<V> = (this.items[key._rdiId || 0]: any)
        if (!rec) {
            rec = this._depFactory.source(key, this)
            this.items[rec.id] = rec
        }
        rec.resolve()

        return rec
    }

    resolveComputed<V>(key: IKey): IComputed<V> {
        const rec: IComputed<V> = this._depFactory.computed(key, this)
        rec.resolve()

        return rec
    }

    resolveHook<V>(key: ?IKey): IComputed<V> {
        if (!key) {
            return emptyCached
        }
        const rec: IComputed<V> = this._depFactory.hook(key, this)
        rec.resolve()

        return rec
    }

    resolveDeps(argDeps: IRawArg[]): IArg[] {
        const items = this.items
        const df = this._depFactory
        const resolvedArgs: IArg[] = []
        let rec: ?ISource<*> | IComputed<*> | IStatus
        for (let i = 0, l = argDeps.length; i < l; i++) {
            const argDep = argDeps[i]
            if (typeof argDep === 'object') {
                const values = []
                for (let prop in argDep) { // eslint-disable-line
                    const key = argDep[prop]
                    rec = (items[key._rdiId || 0]: any)
                    if (!rec) {
                        rec = df.anyDep(key, this)
                        items[rec.id] = rec
                    }
                    rec.resolve()

                    values.push({k: prop, v: rec})
                }
                resolvedArgs.push({t: 1, r: values})
            } else {
                rec = (items[argDep._rdiId || 0]: any)
                if (!rec) {
                    rec = df.anyDep(argDep, this)
                    items[rec.id] = rec
                }
                rec.resolve()

                resolvedArgs.push({t: 0, v: rec})
            }
        }

        return resolvedArgs
    }
}
