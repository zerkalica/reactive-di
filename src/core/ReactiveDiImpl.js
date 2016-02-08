/* @flow */
import type {
    AnyDep,
    AnnotationResolver,
    ReactiveDi,
    AsyncSubscription
} from '../interfaces/nodeInterfaces'
import type {Dependency} from '../interfaces/annotationInterfaces'
import type {Subscription} from '../interfaces/observableInterfaces'
import type {Notify} from '../interfaces/modelInterfaces'

type ListenerManager = {
    notify: Notify;
    add(target: AnyDep): () => void;
};

// implements ListenerManager
class ListenerManagerImpl {
    _listeners: Array<AnyDep>;

    notify: Notify;

    constructor() {
        this._listeners = []
        const self = this
        this.notify = function notify(): void {
            const {_listeners: listeners} = self
            for (let i = 0, l = listeners.length; i < l; i++) {
                listeners[i].resolve();
            }
        }
    }

    add(target: AnyDep): () => void {
        const self = this
        this._listeners.push(target)
        function listenersFilter(dep: AnyDep): boolean {
            return dep !== target
        }

        return function removeListener(): void {
            self._listeners = self._listeners.filter(listenersFilter)
        }
    }
}

// implements Subscription
class DiSubscription {
    _subscriptions: Array<AsyncSubscription>;
    _removeListener: () => void;
    _unmountable: Array<Array<AsyncSubscription>>;

    constructor(
        unmountable: Array<Array<AsyncSubscription>>,
        subscriptions: Array<AsyncSubscription>,
        removeListener: () => void
    ) {
        this._subscriptions = subscriptions
        this._removeListener = removeListener
        this._unmountable = unmountable
        for (let i = 0, l = subscriptions.length; i < l; i++) {
            subscriptions[i].refCount++;
        }
        while (subscriptions = unmountable.pop()) {
            this._unsubscribe(subscriptions)
        }
    }

    _unsubscribe(subscriptions: Array<AsyncSubscription>): void {
        for (let i = 0, l = subscriptions.length; i < l; i++) {
            const subscription = subscriptions[i];
            if (subscription.refCount > 0) {
                subscription.refCount--;
                if (subscription.refCount === 0) {
                    subscription.unsubscribe()
                }
            }
        }
    }

    unsubscribe(): void {
        this._unmountable.push(this._subscriptions)
        this._removeListener()
    }
}

// implements ReactiveDi
export default class ReactiveDiImpl {
    _resolver: AnnotationResolver;
    _listeners: ListenerManager;
    _unmountable: Array<Array<AsyncSubscription>>;

    constructor(createResolver: (notify: Notify) => AnnotationResolver) {
        this._listeners = new ListenerManagerImpl()
        this._resolver = createResolver(this._listeners.notify);
        this._unmountable = []
    }

    subscribe(annotatedDep: Dependency): Subscription {
        const {_resolver: resolver} = this
        const dep: AnyDep = resolver.resolve(annotatedDep);
        const removeListener: () => void = this._listeners.add(dep);
        // If facet subscribed first time and depends on state a.b
        // and we change another branch in state: a.c,
        // facet will be called - because it never called before and cache is empty.
        // Prevent calling facet after first subscription:
        dep.base.isRecalculate = false

        return new DiSubscription(this._unmountable, dep.base.subscriptions, removeListener)
    }

    get(annotatedDep: Dependency): any {
        return this._resolver.resolve(annotatedDep).resolve();
    }
}
