/* @flow */

import type {Dependency, IAnnotations} from './interfaces'
import RawDepMeta from './meta/RawDepMeta'

type SetAnnotation<T: Function> = (target: T) => T;

export default function createAnnotations(setAnnotation: SetAnnotation, tags: Array<string> = []): IAnnotations {
    return {
        setter<S, T: Function>(dep: Dependency<S>, ...deps: Array<Dependency>): (sourceFn: T) => Dependency<T> {
            return function _setter(sourceFn: T): Dependency<T> {
                return setAnnotation(sourceFn, new RawDepMeta({kind: 'setter', deps, tags}))
            }
        },

        factory<T: Function>(...deps: Array<Dependency>): (fn: T) => Dependency<T> {
            return function _factory(fn: T): Dependency<T> {
                return setAnnotation(fn, new RawDepMeta({kind: 'factory', deps, tags}))
            }
        },

        /* eslint-disable no-undef */
        klass<T>(...deps: Array<Dependency>): (proto: Class<T>) => Dependency<T> {
            return function _factory(proto: Class<T>): Dependency<T> {
                return setAnnotation(proto, new RawDepMeta({kind: 'class', deps, tags}))
            }
        },

        meta<T>(value: Dependency<T>): Dependency<T> {
            return setAnnotation(value, new RawDepMeta({kind: 'meta', tags}))
        },

        model<T>(value: Class<T>): Dependency<T> {
            return setAnnotation(value, new RawDepMeta({kind: 'model', tags}))
        }
        /* eslint-enable no-undef */
    }
}
