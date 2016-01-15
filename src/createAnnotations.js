/* @flow */

import type {Dependency, IAnnotations} from './interfaces'
import RawDepMeta from './meta/RawDepMeta'

type SetAnnotation<T: Function> = (target: T) => T;

export default function createAnnotations(setAnnotation: SetAnnotation, tags: Array<string> = []): IAnnotations {
    return {
        /* eslint-disable no-undef */
        klass<T>(...deps: Array<Dependency>): (target: Class<T>) => Dependency<T> {
            return function _factory(target: Class<T>): Dependency<T> {
                return setAnnotation(target, new RawDepMeta({kind: 'klass', deps, tags}))
            }
        },

        factory<T: Function>(...deps: Array<Dependency>): (target: T) => Dependency<T> {
            return function _factory(target: T): Dependency<T> {
                return setAnnotation(target, new RawDepMeta({kind: 'factory', deps, tags}))
            }
        },

        meta<T>(target: Dependency<T>): Dependency<T> {
            function dummyTargetId() {}
            return setAnnotation(dummyTargetId, new RawDepMeta({kind: 'meta', target, tags}))
        },

        model<T>(target: Class<T>): Dependency<T> {
            return setAnnotation(target, new RawDepMeta({kind: 'model', tags}))
        },

        setter<T>(target: Dependency<T>): Dependency<T> {
            function dummyTargetId() {}
            return setAnnotation(dummyTargetId, new RawDepMeta({kind: 'setter', target, tags}))
        }
        /* eslint-enable no-undef */
    }
}
