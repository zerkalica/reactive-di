// @flow

import type {
    UpdaterStatusType,
    IUpdaterStatus
} from './interfaces/updater'

export default class UpdaterStatus {
    type: UpdaterStatusType;
    error: ?Error;
    _retry: ?() => void;

    constructor(
        type?: UpdaterStatusType = 'complete',
        error?: ?Error = null,
        retry?: ?() => void = null
    ) {
        this.type = type
        this._retry = retry
        this.error = error
    }

    retry(): void {
        if (this._retry) {
            this._retry()
        }
    }

    merge(updaters: IUpdaterStatus[]): IUpdaterStatus {
        for (let i = 0, l = updaters.length; i < l; i++) {
            const updater = updaters[i]
            if (updater.type === 'pending') {
                this.type = 'pending'
            }
            if (updater.type === 'error') {
                this.type = 'error'
                this.error = updater.error
                this._retry = updater.retry
                break
            }
        }

        return this
    }
}

if (0) ((new UpdaterStatus(...(0: any))): IUpdaterStatus)
