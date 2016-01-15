/* @flow */

type OnUpdate<T: Object> = (prevInstance: ?T, nextInstance: T) => void;
type OnMount<T: Object> = (instance: ?T) => void;
type OnUnmount<T: Object> = (instance: ?T) => void;

export type HooksRec = {
    onUpdate?: OnUpdate;
    onMount?: OnMount;
    onUnmount?: OnUnmount;
}

function defaultFn() {}

export default class Hooks {
    onUpdate: OnUpdate;
    onMount: OnMount;
    onUnmount: OnUnmount;

    constructor(rec: HooksRec = {}) {
        this.onUpdate = rec.onUpdate || defaultFn
        this.onMount = rec.onMount || defaultFn
        this.onUnmount = rec.onUnmount || defaultFn
    }
}
