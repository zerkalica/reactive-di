/* @flow */
import type {
    AnyDep,
    AnnotationResolver,
    ReactiveDi
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
    _subscriptions: Array<Subscription>;
    _removeListener: () => void;

    constructor(
        subscriptions: Array<Subscription>,
        removeListener: () => void
    ) {
        this._subscriptions = subscriptions
        this._removeListener = removeListener
    }

    unsubscribe(): void {
        const {_subscriptions: subscriptions} = this
        for (let i = 0, l = subscriptions.length; i < l; i++) {
            subscriptions[i].unsubscribe()
        }
        this._removeListener()
    }
}

// implements ReactiveDi
export default class ReactiveDiImpl {
    _resolver: AnnotationResolver;
    _listeners: ListenerManager;

    constructor(createResolver: (notify: Notify) => AnnotationResolver) {
        this._listeners = new ListenerManagerImpl()
        this._resolver = createResolver(this._listeners.notify);
    }

    subscribe(annotatedDep: Dependency): Subscription {
        const {_resolver: resolver} = this
        const dep: AnyDep = resolver.resolve(annotatedDep);
        const removeListener: () => void = this._listeners.add(dep);

        return new DiSubscription(dep.base.subscriptions, removeListener)
    }

    get(annotatedDep: Dependency): any {
        const dep: AnyDep = this._resolver.resolve(annotatedDep);
        dep.resolve()
        return dep.base.value
    }
}
