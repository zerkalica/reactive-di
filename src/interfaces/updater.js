// @flow
import type {Derivable} from './atom'
import type {Key} from './deps'

export type KeyValueSyncUpdate = [Key, mixed]
export type SyncUpdate = KeyValueSyncUpdate | Object
export type AsyncUpdate = Promise<SyncUpdate[]> | Observable<SyncUpdate[], Error>
export type AsyncUpdateThunk = () => AsyncUpdate
export type Transaction = SyncUpdate | AsyncUpdateThunk

export type UpdaterStatusType = 'error' | 'pending' | 'complete'

export interface IUpdaterStatus {
    type: UpdaterStatusType;
    error: ?Error;
    retry(): void;
}

export interface IUpdater {
    static pending: boolean;

    status: Derivable<IUpdaterStatus>;
    set(transactions: Transaction[]): void;
}
