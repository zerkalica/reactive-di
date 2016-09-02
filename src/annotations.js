// @flow
import CustomReflect from 'reactive-di/CustomReflect'
import {
    paramTypesKey,
    metaKey,
    functionTypesKey,

    ComponentMeta,
    ThemeMeta,
    SourceMeta,
    StatusMeta,
    ServiceMeta,
    AbstractMeta
} from 'reactive-di/common'
import type {ArgDep} from 'reactive-di/interfaces/deps'
import Updater from 'reactive-di/Updater'
import type {ComponentMetaRec, SourceMetaRec} from 'reactive-di/common'

const dm = CustomReflect.defineMetadata

export function deps<V: Function>(...args: ArgDep[]): (target: V) => V {
    return (target: V) => {
        if (args.length) {
            dm(paramTypesKey, args, target)
        }
        return target
    }
}

export function factory<V: Function>(target: V): V {
    dm(functionTypesKey, true, target)
    return target
}

export function component<V: Function>(rec?: ComponentMetaRec): (target: V) => V {
    return (target: V) => {
        dm(metaKey, new ComponentMeta(rec || {}), target)
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

export function updaters<V: Function>(...updaters: Class<Updater>[]): (target: V) => V {
    return (target: V) => {
        dm(metaKey, new StatusMeta(updaters), target)
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
