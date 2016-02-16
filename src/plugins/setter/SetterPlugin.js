/* @flow */

import SetterDepImpl from 'reactive-di/plugins/setter/impl/SetterDepImpl'
import defaultFinalizer from 'reactive-di/plugins/factory/defaultFinalizer'
import InvokerImpl from 'reactive-di/plugins/factory/InvokerImpl'
import MetaAnnotationImpl from 'reactive-di/plugins/meta/MetaAnnotationImpl'
import type {
    AnyDep,
    AnnotationResolver
} from 'reactive-di/i/nodeInterfaces'
import type {Plugin} from 'reactive-di/i/pluginInterfaces' // eslint-disable-line
import type {MetaDep} from 'reactive-di/i/plugins/metaInterfaces'
import type {
    SetterDep,
    SetterAnnotation
} from 'reactive-di/i/plugins/setterInterfaces'

// depends on factory, model
// implements Plugin
export default class SetterPlugin {
    create<V: Object, E>(annotation: SetterAnnotation<V, E>, acc: AnnotationResolver): void {
        const {base} = annotation
        const {id, target, info} = base
        const newAcc = acc.newRoot()
        const model: AnyDep = newAcc.resolve(annotation.model);
        if (model.kind !== 'model' && model.kind !== 'asyncmodel') {
            throw new Error(
                'Not a model dep type: ' + model.kind + ' in ' + model.base.info.displayName
            )
        }
        const meta: MetaDep<E> = (newAcc.resolveAnnotation(new MetaAnnotationImpl(
            id + '.meta',
            target,
            info.tags
        )): any);

        const dep: SetterDepImpl<V, E> = new SetterDepImpl(
            id,
            base.info,
            acc.listeners.notify,
            model,
            meta,
            new InvokerImpl(target, newAcc.getDeps(annotation.deps, target, info.tags))
        );
        acc.begin(dep)
        acc.end(dep)
    }

    finalize(dep: SetterDep, target: AnyDep): void {
        defaultFinalizer(dep, target)
    }
}
