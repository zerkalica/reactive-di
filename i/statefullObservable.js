/* @flow */

export type StatefullObservable<V, E> = {
    observable: Observable<V, E>;
    initialData: V;
}
