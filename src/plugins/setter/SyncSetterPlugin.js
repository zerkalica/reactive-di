/* @flow */

import createSetterInvoker from 'reactive-di/plugins/setter/impl/createSetterInvoker'
import SyncSetterDepImpl from 'reactive-di/plugins/setter/impl/SyncSetterDepImpl'
import type {AnnotationResolver} from 'reactive-di/i/nodeInterfaces'
import type {Plugin} from 'reactive-di/i/pluginInterfaces' // eslint-disable-line
import type {
    SyncSetterDep,
    SyncSetterAnnotation
} from 'reactive-di/i/plugins/setterInterfaces'
import type {ModelDep} from 'reactive-di/i/plugins/modelInterfaces'

// depends on factory, model
// implements Plugin
export default class SyncSetterPlugin {
    create<V: Object>(annotation: SyncSetterAnnotation<V>, acc: AnnotationResolver): void {
        const id = annotation.id = acc.createId(); // eslint-disable-line
        const newAcc = acc.newRoot()
        const model: ModelDep<V> = newAcc.resolve(annotation.model);
        if (model.kind !== 'model') {
            throw new Error(
                `Not a model dep type: ${model.kind} in ${model.base.displayName}`
            )
        }
        const dep: SyncSetterDepImpl<V> = new SyncSetterDepImpl(
            annotation,
            newAcc.listeners.notify,
            model,
            createSetterInvoker(
                annotation.target,
                annotation.deps,
                [annotation.kind],
                model,
                newAcc
            )
        );
        newAcc.begin(dep)
        newAcc.end(dep)
    }

    finalize(dep: SyncSetterDep, target: Object): void {} // eslint-disable-line
}
