//@flow

import {DepInfo, StatusMeta, IHandler} from '../common'
import type {Derivable} from '../../interfaces/atom'
import Updater, {UpdaterStatus} from '../../Updater'

function mergeStatus(target: Class<UpdaterStatus>, updaters: UpdaterStatus[]): UpdaterStatus {
    const us: UpdaterStatus = new target('complete')
    for (let i = 0, l = updaters.length; i < l; i++) {
        const updater = updaters[i]
        if (updater.pending) {
            us.pending = true
        }
        if (updater.error) {
            us.error = updater.error
            us.retry = updater.retry
            break
        }
    }

    return us
}

function mapToStatus(upd: Updater): UpdaterStatus {
    return upd.status.get()
}

export default class StatusHandler {
    handle({
        meta,
        target,
        ctx
    }: DepInfo<StatusMeta>): Derivable<UpdaterStatus> {
        const updaterKeys = meta.updaters
        const statuses: Derivable<UpdaterStatus>[] = []
        for (let i = 0; i < updaterKeys.length; i++) {
            statuses.push(ctx.val(updaterKeys[i]).derive(mapToStatus))
        }
        const merge = (updaters: UpdaterStatus[]) => mergeStatus(target, updaters)
        return ctx.adapter.struct(statuses).derive(merge)
    }

    postHandle(): void {}
}

if (0) ((new StatusHandler(...(0: any))): IHandler<StatusMeta, Derivable<UpdaterStatus>>)
