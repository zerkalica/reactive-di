/* @flow */
import type {
    Provider,
    RelationUpdater
} from 'reactive-di/i/coreInterfaces'

class DummyRelationUpdater {
    length: number = 0;
    /* eslint-disable no-unused-vars */
    begin(provider: Provider): void {}
    end(provider: Provider): void {}
    addCached(provider: Provider): void {}
}

export default function creteDummyRelationUpdater(): RelationUpdater {
    return new DummyRelationUpdater()
}
