/* @flow */
export default class CacheImpl<T> {
    value: ?T;
    isRecalculate: boolean;

    constructor(value?: ?T = null, isRecalculate?: boolean = false) {
        this.value = value
        this.isRecalculate = isRecalculate
    }
}
