/* @flow */

import createSetterInvoker from 'reactive-di/plugins/setter/impl/createSetterInvoker'
import AsyncSetterDepImpl from 'reactive-di/plugins/setter/impl/AsyncSetterDepImpl'
import type {
    AnyDep,
    AnnotationResolver
} from 'reactive-di/i/nodeInterfaces'
import type {Plugin} from 'reactive-di/i/pluginInterfaces' // eslint-disable-line
import type {
    AsyncSetterDep,
    AsyncSetterAnnotation
} from 'reactive-di/i/plugins/setterInterfaces'

// depends on factory, model
// implements Plugin
export default class AsyncSetterPlugin {
    create<V: Object, E>(annotation: AsyncSetterAnnotation<V, E>, acc: AnnotationResolver): void {
        const {base} = annotation
        const newAcc = acc.newRoot()
        const model: AnyDep = newAcc.resolve(annotation.model);
        if (model.kind !== 'model') {
            throw new Error(
                `Not a model dep type: ${model.kind} in ${model.base.info.displayName}`
            )
        }
        const dep: AsyncSetterDepImpl<V, E> = new AsyncSetterDepImpl(
            base.id,
            base.info,
            newAcc.listeners.notify,
            model
        );
        newAcc.begin(dep)
        dep.setInvoker(createSetterInvoker(
            base.target,
            annotation.deps,
            base.info.tags,
            model,
            newAcc
        ))
        newAcc.end(dep)
        acc.addRelation(base.id)
        const {childSetters} = dep
        for (let i = 0, l = childSetters.length; i < l; i++) {
            acc.addRelation(childSetters[i].base.id)
        }
    }

    finalize(dep: AsyncSetterDep, target: AnyDep): void {
        if (target.kind === 'asyncsetter') {
            dep.childSetters.push(target)
        }
    }
}
