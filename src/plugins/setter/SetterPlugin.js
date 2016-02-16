/* @flow */

import SetterDepImpl from '~/plugins/setter/impl/SetterDepImpl'
import defaultFinalizer from '~/plugins/factory/defaultFinalizer'
import InvokerImpl from '~/plugins/factory/InvokerImpl'
import MetaAnnotationImpl from '~/plugins/meta/MetaAnnotationImpl'
import type {
    AnyDep,
    AnnotationResolver
} from 'reactive-di/i/nodeInterfaces'
import type {Plugin} from 'reactive-di/i/pluginInterfaces' // eslint-disable-line
import type {MetaDep} from '~/plugins/meta/metaInterfaces'
import type {
    SetterDep,
    SetterAnnotation
} from '~/plugins/setter/setterInterfaces'

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
