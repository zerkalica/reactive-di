/* @flow */

import createSetterInvoker from 'reactive-di/plugins/setter/impl/createSetterInvoker'
import AsyncSetterDepImpl from 'reactive-di/plugins/setter/impl/AsyncSetterDepImpl'
import type {
    AnnotationResolver
} from 'reactive-di/i/nodeInterfaces'
import type {Plugin} from 'reactive-di/i/pluginInterfaces' // eslint-disable-line
import type {
    AsyncSetterDep,
    AsyncSetterAnnotation
} from 'reactive-di/i/plugins/setterInterfaces'
import type {ModelDep} from 'reactive-di/i/plugins/modelInterfaces'

// depends on factory, model
// implements Plugin
export default class AsyncSetterPlugin {
    kind: 'asyncsetter' = 'asyncsetter';
    create<V: Object, E>(annotation: AsyncSetterAnnotation<V, E>, acc: AnnotationResolver): void {
        const id = annotation.id = acc.createId(); // eslint-disable-line
        const newAcc = acc.newRoot()
        const model: ModelDep<V> = newAcc.resolve(annotation.model);
        if (model.kind !== 'model') {
            throw new Error(
                `Not a model dep type: ${model.kind} in ${model.base.info.displayName}`
            )
        }
        const dep: AsyncSetterDepImpl<V, E> = new AsyncSetterDepImpl(
            annotation,
            newAcc.listeners.notify,
            model
        );
        newAcc.begin(dep)
        dep.setInvoker(createSetterInvoker(
            annotation.target,
            annotation.deps,
            dep.base.tags,
            model,
            newAcc
        ))
        newAcc.end(dep)
        acc.addRelation(id)
        const {childSetters} = dep
        for (let i = 0, l = childSetters.length; i < l; i++) {
            acc.addRelation(childSetters[i].base.id)
        }
    }

    finalize(dep: AsyncSetterDep, target: Object|AsyncSetterDep): void {
        if (target.kind === 'asyncsetter') {
            dep.childSetters.push(target)
        }
    }
}
