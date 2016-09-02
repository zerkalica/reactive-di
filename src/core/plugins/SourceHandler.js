//@flow

import {DepInfo, SourceMeta, IHandler} from '../common'
import type {Atom, Adapter, CacheMap, Derivable} from '../../interfaces/atom'
import type {SingleUpdate} from '../../interfaces/updater'
import Updater from '../../Updater'

type AsyncThunk<V: Object> = () => Promise<V>|Observable<V, Error>

function createUpdateSource<V: Object, Raw: Object>(target: Class<V>): (rec: [Updater, ?SingleUpdate]) => void {
    let oldUpdater: ?Updater
    let oldLoaderResult: ?SingleUpdate

    return function updateSource([updater, loaderResult]: [Updater, ?SingleUpdate]): void {
        if (!loaderResult) {
            return
        }

        if (
            oldUpdater &&
            (oldUpdater !== updater || (oldLoaderResult !== loaderResult))
        ) {
            oldUpdater.cancel()
        }
        if (loaderResult) {
            updater.setSingle(loaderResult, target)
        }
        oldLoaderResult = loaderResult
        oldUpdater = updater
    }
}

export default class SourceHandler {
    handle({
        meta,
        target,
        ctx
    }: DepInfo<SourceMeta>): Atom<*> {
        let atom: Atom<*>
        const value: any = ctx.defaults[meta.key]
        if (meta.construct) {
            atom = ctx.adapter.isAtom(value)
                ? value.derive((v: mixed) => ctx.preprocess(new target(value)))
                : ctx.adapter.atom(ctx.preprocess(new target(value))) // eslint-disable-line
        } else {
            atom = ctx.adapter.isAtom(value)
                ? value
                : ctx.adapter.atom(ctx.preprocess(value || new target()))
        }

        return atom
    }

    postHandle({
        meta,
        target,
        ctx
    }: DepInfo<SourceMeta>): void {
        if (!meta.updater) {
            return
        }

        const updaterAtom: Derivable<Updater> = ctx.val(meta.updater)
        if (!meta.loader) {
            throw new Error(`Provide loader for ${ctx.debugStr(target)}`)
        }
        const loaderAtom: Derivable<?SingleUpdate> = ctx.val(meta.loader)

        ctx.adapter.struct([updaterAtom, loaderAtom]).react(createUpdateSource(target), {
            until: ctx.stopped
        })
    }
}

if (0) ((new SourceHandler(...(0: any))): IHandler<SourceMeta, Atom<*>>)
