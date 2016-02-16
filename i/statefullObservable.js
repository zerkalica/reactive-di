/* @flow */

export interface StatefullObservable<V, E> {
    observable: Observable<V, E>;
    initialData: V;
}
