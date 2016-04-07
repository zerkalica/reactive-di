/* @flow */
import type {
    Provider
} from 'reactive-di/i/nodeInterfaces'

export default class DummyRelationUpdater {
    /* eslint-disable no-unused-vars */
    begin(provider: Provider): void {}
    end(provider: Provider): void {}
    inheritRelations(provider: Provider): void {}
}
