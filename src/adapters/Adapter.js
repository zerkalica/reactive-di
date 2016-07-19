// @flow


export interface LifeCycle {
    onStart: ?() => void;
    onStop: ?() => void;
}

export interface Reactor<T> {
    start(): void;
    stop(): void;
}

export interface Derivable<V> {
    get(): V;
    derive<E>(f: (value: V) => E): Derivable<E>;
    react(fn: (v: V) => void, lc?: ?LifeCycle): void;
    reactor<T>(fn: ((v: T) => void)|Reactor<T>): Reactor<T>;
}

export interface Atom<V> extends Derivable<V> {
    set(v: V): void;
}

export type Result<V> = Derivable<V>|Atom<V>
export type DerivableDict = {[id: string]: Result<*>}
export type DerivableArg = Result<*> | DerivableDict

export interface Adapter {
    isAtom(v: mixed): boolean;
    atom<V>(value: V): Atom<V>;
    atomFromObservable<V>(value: V, observable: (Promise<V> | Observable<V, Error>)): Atom<V>;
    struct<T>(value: DerivableArg[]): Derivable<T>;
}
