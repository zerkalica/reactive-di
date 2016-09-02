//@flow

import {DepInfo, ComponentMeta, IContext, IHandler} from '../common'
import type {RdiMeta} from '../common'
import type {Atom, Derivable, CacheMap} from '../../interfaces/atom'
import type {CreateWidget, RawStyleSheet} from '../../interfaces/component'

function createThemesReactor(): (rec: [RawStyleSheet[], boolean]) => void {
    let oldThemes: RawStyleSheet[] = []
    let mountCount: number = 0

    return function themesReactor([themes, isMounted]: [RawStyleSheet[], boolean]): void {
        mountCount = mountCount + (isMounted ? 1 : -1)
        const themesChanged: boolean = themes !== oldThemes

        if (mountCount === 0 || themesChanged) {
            for (let i = 0; i < oldThemes.length; i++) {
                oldThemes[i].__styles.detach()
            }
        }
        if (mountCount === 1 || themesChanged) {
            for (let i = 0; i < themes.length; i++) {
                themes[i].__styles.attach()
            }
            oldThemes = themes
        }
    }
}

class ThemesCollector {
    themes: Derivable<RawStyleSheet>[] = []
    add(di: DepInfo<*>, atom: Derivable<RawStyleSheet>) {
        if (di.meta.type === 'theme') {
            this.themes.push(atom)
        }
    }
}

export default class ComponentHandler {
    _componentCache: CacheMap = new Map()
    _createComponent: CreateWidget<*, *, *>

    constructor(
        createComponent: CreateWidget<*, *, *>
    ) {
        this._createComponent = createComponent
    }

    handle({
        target,
        deps,
        meta,
        name,
        key,
        ctx
    }: DepInfo<ComponentMeta>): Atom<*> {
        let atom: ?Atom<*> = this._componentCache.get(key)
        if (atom) {
            return atom
        }
        const container: IContext = meta.deps
            ? ctx.create(name).register(meta.deps)
            : ctx

        const themes: Derivable<RawStyleSheet>[] = []
        const tc = new ThemesCollector()
        const depsAtom: Derivable<mixed[]> = container.resolveDeps(deps, tc)
        const isMounted: Atom<boolean> = ctx.adapter.atom(false)

        atom = ctx.adapter.atom((this._createComponent(
            target,
            depsAtom,
            isMounted
        ): any))

        ctx.adapter.struct([tc.themes, isMounted]).react(createThemesReactor(), {
            skipFirst: true,
            until: ctx.stopped
        })

        this._componentCache.set(key, atom)

        return atom
    }

    postHandle(): void {}
}

if (0) ((new ComponentHandler(...(0: any))): IHandler<ComponentMeta, Atom<*>>)
