/* @flow */
import type {
    AnyDep,
    AnnotationResolver,
    ReactiveDi, // eslint-disable-line
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
    _removeListener: () => void;

    constructor(
        removeListener: () => void
    ) {
        this._removeListener = removeListener
    }

    unsubscribe(): void {
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
        // If facet subscribed first time and depends on state a.b
        // and we change another branch in state: a.c,
        // facet will be called - because it never called before and its cache is empty.
        // Prevent calling facet after first subscription:
        dep.base.isRecalculate = false

        return new DiSubscription(removeListener)
    }

    get(annotatedDep: Dependency): any {
        return this._resolver.resolve(annotatedDep).resolve();
    }
}
