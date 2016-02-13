/* @flow */

import type {Dependency} from '../interfaces/annotationInterfaces'
import type {
    SetState,
    Updater,
    CreateUpdater,
    ReactiveDi // eslint-disable-line
} from '../interfaces/diInterfaces'
import type {Notify} from '../interfaces/modelInterfaces'
import type {
    AnyDep,
    AnnotationResolver
} from '../interfaces/nodeInterfaces'
import type {Subscription} from '../interfaces/observableInterfaces'

import type {FactoryAnnotator} from '../plugins/factory/factoryInterfaces'

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

// implements Updater
class UpdaterImpl<State: Object, ModelDef: Object> {
    _subscription: ?Subscription;
    _updaterDep: (state: State) => State;

    _resolver: AnnotationResolver;
    _listeners: ListenerManager;

    _unsubscribe: ?() => void;

    constructor(
        viewModelDef: ModelDef,
        setState: SetState,
        displayName: string,
        factoryAnnotator: FactoryAnnotator,
        resolver: AnnotationResolver,
        listeners: ListenerManager
    ) {
        this._resolver = resolver
        this._listeners = listeners

        const self = this
        function updater(state: State): State {
            if (self._unsubscribe) {
                setState(state)
            }
            return state
        }
        updater.displayName = displayName + '_updater'
        this._updaterDep = factoryAnnotator(viewModelDef)(updater)
        this._unsubscribe = null
    }

    getInitialState(): State {
        return (this._resolver.resolve(this._updaterDep).resolve(): any)
    }

    mount(): void {
        if (this._unsubscribe) {
            return
        }

        const dep: AnyDep = this._resolver.resolve(this._updaterDep);
        // If facet subscribed first time and depends on state a.b
        // and we change another branch in state: a.c,
        // facet will be called - because it never called before and its cache is empty.
        // Prevent calling facet after first subscription:
        dep.base.isRecalculate = false

        this._unsubscribe = this._listeners.add(dep)
    }

    unmount(): void {
        if (!this._unsubscribe) {
            return
        }
        this._unsubscribe()
        this._unsubscribe = null
    }
}

// implements ReactiveDi
export default class ReactiveDiImpl {
    createUpdater: CreateUpdater;
    get: (annotatedDep: Dependency) => any;

    constructor(
        createResolver: (notify: Notify) => AnnotationResolver,
        factoryAnnotator: FactoryAnnotator
    ) {
        const listeners: ListenerManager = new ListenerManagerImpl();
        const resolver: AnnotationResolver = createResolver(listeners.notify)

        function createUpdater<State: Object, ModelDef: Object>(
            viewModelDef: ModelDef,
            setState: SetState<State>,
            displayName: string
        ): Updater<State> {
            return new UpdaterImpl(
                viewModelDef,
                setState,
                displayName,
                factoryAnnotator,
                resolver,
                listeners
            )
        }
        this.createUpdater = createUpdater

        function get(annotatedDep: Dependency): any {
            return resolver.resolve(annotatedDep).resolve();
        }
        this.get = get
    }
}
