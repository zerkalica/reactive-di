/* @flow */

declare interface Observer<V, E> {
    next(value: V): void;
    error(errorValue: E): void;
    complete(completeValue?: any): void;
}

declare interface SubscriptionObserver<V, E> {
    next(value: V): void;
    error(errorValue: E): void;
    complete(completeValue?: any): void;
}

declare interface Subscription {
    unsubscribe(): void;
}

declare function SubscriberFunction(observer: SubscriptionObserver): (() => void)|Subscription;

declare class $SymbolHasInstance mixins Symbol {}
declare class $SymboIsConcatSpreadable mixins Symbol {}
declare class $SymbolIterator mixins Symbol {}
declare class $SymbolMatch mixins Symbol {}
declare class $SymbolReplace mixins Symbol {}
declare class $SymbolSearch mixins Symbol {}
declare class $SymbolSpecies mixins Symbol {}
declare class $SymbolSplit mixins Symbol {}
declare class $SymbolToPrimitive mixins Symbol {}
declare class $SymbolToStringTag mixins Symbol {}
declare class $SymbolUnscopables mixins Symbol {}
declare class $SymbolObservable mixins Symbol {}

declare class Symbol {
    static (value?:any): Symbol;
    static for(key: string): Symbol;
    static hasInstance: $SymbolHasInstance;
    static isConcatSpreadable: $SymboIsConcatSpreadable;
    static iterator: string; // polyfill '@@iterator'
    static keyFor(sym: Symbol): ?string;
    static length: 0;
    static match: $SymbolMatch;
    static replace: $SymbolReplace;
    static search: $SymbolSearch;
    static species: $SymbolSpecies;
    static split: $SymbolSplit;
    static observable: $SymbolObservable;
    static toPrimitive: $SymbolToPrimitive;
    static toStringTag: $SymbolToStringTag;
    static unscopables: $SymbolUnscopables;
    toString(): string;
    valueOf(): ?Symbol;
}

declare type $ObservableObject<V, E> = mixed

declare class Observable<V, E> {
    constructor(subscriber: SubscriberFunction): Observable<V, E>;

    // Subscribes to the sequence
    subscribe(observer: Observer<V, E>): Subscription;

    // Subscribes to the sequence with a callback, returning a promise
    forEach(onNext: (v: V) => void): Promise<void>;

    // Converts items to an Observable
    static of<VV, EE>(...items: any) : Observable<VV, EE>;
    // Converts an observable or iterable to an Observable
    static from<V, E>(observable: Observable|Iterator|$ObservableObject<V, E>): Observable<V, E>;
}
