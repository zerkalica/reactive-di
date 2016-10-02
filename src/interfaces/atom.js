// @flow

export interface LifeCycle {
    until?: Derivable<boolean>;
    onStart?: () => void;
    onStop?: () => void;
}

export type IsEqual<V> = (old: V, newValue: V) => boolean

export interface Derivable<V> {
    get(): V;
    withEquality(isEqual: IsEqual<V>): Derivable<V>;
    derive<E>(f: (value: V) => E): Derivable<E>;
    react(fn: (v: V) => void, lc?: ?LifeCycle): void;
}

export interface Atom<V> extends Derivable<V> {
    set: (v: V) => void;
    swap<E>(f: (v: V) => E): void;
    withEquality(isEqual: IsEqual<V>): Atom<V>;
}

export type DerivableDict = {[id: string]: Derivable<*>}
export type DerivableArg = any

export interface Adapter {
    isAtom(v: mixed): boolean;
    transact(f: () => void): void;
    atom<V>(value: V): Atom<V>;
    struct<R>(value: DerivableArg[]): Derivable<R>;
}

export type CacheMap = Map<Function|string, ?Atom<*>>
