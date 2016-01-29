/* @flow */
import type {
    AnyDep,
    DependencyResolver
} from '../nodeInterfaces'
import type {Dependency} from '../annotationInterfaces'
import type {Subscription} from '../observableInterfaces'
import type {Notifier} from '../modelInterfaces'

// implements ReactiveDi, Notifier
export default class ReactiveDiImpl {
    _resolver: DependencyResolver;
    _listeners: Array<AnyDep>;

    constructor(createResolver: (notifier: Notifier) => DependencyResolver) {
        this._resolver = createResolver((this: Notifier))
    }

    notify(): void {
        const {_listeners: listeners, _resolver: resolver} = this
        for (let i = 0, l = listeners.length; i < l; i++) {
            resolver.get(listeners[i])
        }
    }

    subscribe(annotatedDep: Dependency): Subscription {
        const self = this
        const dep: AnyDep = this._resolver.get(annotatedDep);
        this._listeners.push(dep)
        function listenersFilter(registeredDep: AnyDep): boolean {
            return dep !== registeredDep
        }
        const subscriptions: Array<Subscription> = dep.base.subscriptions;
        function unsubscribe() {
            for (let i = 0, l = subscriptions.length; i < l; i++) {
                subscriptions[i].unsubscribe()
            }
            self._listeners = self._listeners.filter(listenersFilter)
        }

        return {unsubscribe}
    }

    get<V: any, E>(annotatedDep: Dependency<V>): V {
        return this._resolver.get(annotatedDep).base.value
    }
}
