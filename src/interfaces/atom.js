// @flow

export interface LifeCycle {
    until?: Derivable<boolean>;
    onStart?: () => void;
    onStop?: () => void;
}

export interface Derivable<V> {
    get(): V;
    derive<E>(f: (value: V) => E): Derivable<E>;
    react(fn: (v: V) => void, lc?: ?LifeCycle): void;
}

export interface Atom<V> extends Derivable<V> {
    set(v: V): void;
}

export type DerivableDict = {[id: string]: Derivable<*>}
export type DerivableArg = any

export interface Adapter {
    isAtom(v: mixed): boolean;
    transact(f: () => void): void;
    atom<V>(value: V): Atom<V>;
    atomFromObservable<V>(value: V, observable: (Promise<V> | Observable<V, Error>)): Atom<V>;
    struct<R>(value: DerivableArg[]): Derivable<R>;
}
