/* @flow */

import createSetterInvoker from 'reactive-di/plugins/setter/impl/createSetterInvoker'
import SyncSetterDepImpl from 'reactive-di/plugins/setter/impl/SyncSetterDepImpl'
import type {
    AnyDep,
    AnnotationResolver
} from 'reactive-di/i/nodeInterfaces'
import type {Plugin} from 'reactive-di/i/pluginInterfaces' // eslint-disable-line
import type {
    SyncSetterDep,
    SyncSetterAnnotation
} from 'reactive-di/i/plugins/setterInterfaces'

// depends on factory, model
// implements Plugin
export default class SyncSetterPlugin {
    create<V: Object>(annotation: SyncSetterAnnotation<V>, acc: AnnotationResolver): void {
        const {base} = annotation
        const newAcc = acc.newRoot()
        const model: AnyDep = newAcc.resolve(annotation.model);
        if (model.kind !== 'model') {
            throw new Error(
                `Not a model dep type: ${model.kind} in ${model.base.info.displayName}`
            )
        }
        const dep: SyncSetterDepImpl<V> = new SyncSetterDepImpl(
            base.id,
            base.info,
            newAcc.listeners.notify,
            model,
            createSetterInvoker(
                base.target,
                annotation.deps,
                base.info.tags,
                model,
                newAcc
            )
        );
        newAcc.begin(dep)
        newAcc.end(dep)
    }

    finalize(dep: SyncSetterDep, target: AnyDep): void {} // eslint-disable-line
}
