/* @flow */
export default class CacheImpl<T> {
    value: T;
    isRecalculate: boolean;

    constructor(isRecalculate?: boolean = false) {
        this.isRecalculate = isRecalculate
    }
}
