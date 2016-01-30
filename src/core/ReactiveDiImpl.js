/* @flow */
import type {
    AnyDep,
    AnnotationResolver,
    ReactiveDi
} from '../interfaces/nodeInterfaces'
import type {Dependency} from '../interfaces/annotationInterfaces'
import type {Subscription} from '../interfaces/observableInterfaces'
import type {Notify} from '../interfaces/modelInterfaces'

type ListenersRef = {listeners: Array<AnyDep>};

// implements Subscription
class DiSubscription {
    _subscriptions: Array<Subscription>;
    _ref: ListenersRef;
    _listenersFilter: (dep: AnyDep) => boolean;

    constructor(target: AnyDep, subscriptions: Array<Subscription>, ref: ListenersRef) {
        this._subscriptions = subscriptions
        this._ref = ref
        this._listenersFilter = function listenersFilter(dep: AnyDep): boolean {
            return dep !== target
        }
    }

    unsubscribe(): void {
        const {_ref: ref, _subscriptions: subscriptions} = this
        for (let i = 0, l = subscriptions.length; i < l; i++) {
            subscriptions[i].unsubscribe()
        }
        ref.listeners = ref.listeners.filter(this._listenersFilter)
    }
}

// implements ReactiveDi
export default class ReactiveDiImpl {
    _resolver: AnnotationResolver;
    _ref: ListenersRef;

    constructor(createResolver: (notify: Notify) => AnnotationResolver) {
        const ref: ListenersRef = this._ref = {listeners: []};

        function notify(): void {
            const {listeners} = ref
            for (let i = 0, l = listeners.length; i < l; i++) {
                listeners[i].resolve();
            }
        }

        const resolver: AnnotationResolver = this._resolver = createResolver(notify);
    }

    subscribe(annotatedDep: Dependency): Subscription {
        const {_ref: ref, _resolver: resolver} = this
        const dep: AnyDep = resolver.resolve(annotatedDep);
        ref.listeners.push(dep)
        return new DiSubscription(dep, dep.base.subscriptions, ref)
    }

    get(annotatedDep: Dependency): any {
        const dep: AnyDep = this._resolver.resolve(annotatedDep);
        dep.resolve()
        return dep.base.value
    }
}
