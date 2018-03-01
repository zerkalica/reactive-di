// @flow
export interface IHost<V> {
    value(): V;
    forceUpdate(): void;
}
export interface IReaction<V> {
    value(): V;
    destructor(): void;
    reset(): void;
    constructor(
        name: string,
        host: IHost<V>
    ): self;
}
