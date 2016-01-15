/* @flow */

export type DepId = string;
export type IdsMap = {[id: DepId]: Array<DepId>};
/* eslint-disable no-undef */
export type Dependency<T> = Class<T>;
/* eslint-enable no-undef */
export type FromJS<T: Object> = (data: Object) => T;

type Setter<S, T: Function> = (dep: Dependency<S>, ...rawDeps: Array<Dependency>) => (sourceFn: T) => Dependency<T>;
type Factory<T: Function> = (...rawDeps: Array<Dependency>) => (fn: T) => Dependency<T>;
/* eslint-disable no-undef */
type Klass<T> = (...rawDeps: Array<Dependency>) => (proto: Class<T>) => Dependency<T>;
type Meta<T> = (value: Dependency<T>) => Dependency<T>;
type Model<T> = (mdl: Class<T>) => Dependency<T>;
/* eslint-enable no-undef */

export type IAnnotations = {
    setter: Setter;
    factory: Factory;
    klass: Klass;
    model: Model;
    meta: Meta;
}

export class AbstractDataCursor<V> {
    get(): V|any {}
    fromJS: FromJS;
    /* eslint-disable no-unused-vars */
    set(newModel: V): boolean {
        return true
    }
    /* eslint-enable no-unused-vars */
}
