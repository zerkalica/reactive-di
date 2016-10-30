// @flow
import CustomReflect from 'reactive-di/CustomReflect'
import {
    paramTypesKey,
    metaKey,
    subtypeKey,
    lcKey,

    ComponentMeta,
    ThemeMeta,
    SourceMeta,
    StatusMeta,
    ServiceMeta,
    AbstractMeta
} from 'reactive-di/core/common'
import type {ArgDep, LifeCycle} from 'reactive-di/interfaces/deps' // eslint-disable-line
import Updater from 'reactive-di/core/Updater'
import type {ComponentMetaRec, SourceMetaRec} from 'reactive-di/core/common'

const dm = CustomReflect.defineMetadata

export function deps<V: Function>(...args: ArgDep[]): (target: V) => V {
    return (target: V) => {
        if (args.length) {
            dm(paramTypesKey, args, target)
        }
        return target
    }
}

export function factory<V: Function>(target: V, isJsx?: boolean): V {
    dm(subtypeKey, isJsx ? 'jsx' : 'func', target)
    return target
}

export function component<V: Function>(rec?: ComponentMetaRec): (target: V) => V {
    return (target: V) => {
        dm(metaKey, new ComponentMeta(rec || {}), target)
        dm(subtypeKey, 'jsx', target)
        return target
    }
}

export function theme<V: Function>(target: V): V {
    dm(metaKey, new ThemeMeta(), target)
    return target
}

export function source<R, V: Class<R>>(rec: SourceMetaRec): (target: V) => V {
    return (target: V) => {
        dm(metaKey, new SourceMeta(rec), target)
        return target
    }
}

export function updaters<V: Function>(...items: Class<Updater>[]): (target: V) => V {
    return (target: V) => {
        dm(metaKey, new StatusMeta(items), target)
        return target
    }
}

export function service<V: Function>(target: V): V {
    dm(metaKey, new ServiceMeta(), target)
    return target
}

export function abstract<V: Function>(target: V): V {
    dm(metaKey, new AbstractMeta(), target)
    return target
}

export function hooks<V: Function>(target: V): (lc: Class<LifeCycle<*>>) => Class<LifeCycle<*>> {
    return (lc: Class<LifeCycle<*>>) => {
        dm(lcKey, lc, target)
        dm(metaKey, new ServiceMeta(), lc)
        return lc
    }
}

let cloneNumber: number = 0

export function cloneComponent<C: Function>(src: C, rec?: ComponentMetaRec): C {
    function target(arg1: any, arg2: any, arg3: any) {
        return src(arg1, arg2, arg3)
    }
    target.displayName = (src.displayName || src.name) + '#clone-' + (cloneNumber || '0')
    cloneNumber++ // eslint-disable-line
    Object.setPrototypeOf(target, src)
    if (rec) {
        dm(metaKey, new ComponentMeta(rec), target)
    }

    return (target: any)
}
