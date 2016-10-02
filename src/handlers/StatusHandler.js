// @flow

import {DepInfo, StatusMeta, IHandler} from 'reactive-di/core/common'
import type {Atom, Derivable} from 'reactive-di/interfaces/atom'
import Updater, {UpdaterStatus} from 'reactive-di/core/Updater'

function mergeStatus(target: Class<UpdaterStatus>, updaters: UpdaterStatus[]): UpdaterStatus {
    /* eslint-disable new-cap */
    const us: UpdaterStatus = new target('complete')
    for (let i = 0, l = updaters.length; i < l; i++) {
        const updater = updaters[i]
        if (updater.pending) {
            us.pending = true
            us.complete = false
        }
        if (updater.error) {
            us.error = updater.error
            us.retry = updater.retry
            us.complete = false
            us.pending = false
            break
        }
    }

    return us
}

function mapToStatus(upd: Updater): UpdaterStatus {
    return upd.status.get()
}

export default class StatusHandler {
    handle<V>({
        meta,
        target,
        ctx
    }: DepInfo<V, StatusMeta>): Atom<V> {
        const updaterKeys = meta.updaters
        const statuses: Derivable<UpdaterStatus>[] = []
        for (let i = 0; i < updaterKeys.length; i++) {
            statuses.push(ctx.val(updaterKeys[i]).derive(mapToStatus))
        }
        const merge = (updaters: UpdaterStatus[]) => mergeStatus(target, updaters)
        return (ctx.adapter.struct(statuses).derive(merge): any)
    }
}

if (0) ((new StatusHandler(...(0: any))): IHandler) // eslint-disable-line
