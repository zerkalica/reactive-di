/* @flow */

declare class StatefullObservable<V, E> {
    observable: Observable<V, E>;
    initialData: V;
}
