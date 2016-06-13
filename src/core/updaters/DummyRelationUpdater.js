/* @flow */
import type {
    Provider
} from 'reactive-di'

export default class DummyRelationUpdater {
    length: number = 0;
    /* eslint-disable no-unused-vars */
    begin(provider: Provider): void {}
    end(provider: Provider): void {}
    addCached(provider: Provider): void {}
}
