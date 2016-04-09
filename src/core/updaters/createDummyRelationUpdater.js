/* @flow */
import type {
    Provider,
    RelationUpdater
} from 'reactive-di/i/coreInterfaces'

class DummyRelationUpdater {
    /* eslint-disable no-unused-vars */
    begin(provider: Provider): void {}
    end(provider: Provider): void {}
    inheritRelations(provider: Provider): void {}
}

export default function creteDummyRelationUpdater(): RelationUpdater {
    return new DummyRelationUpdater()
}
