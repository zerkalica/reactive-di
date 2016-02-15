/* @flow */

import SetterDepImpl from './impl/SetterDepImpl'
import defaultFinalizer from '../factory/defaultFinalizer'
import InvokerImpl from '../factory/InvokerImpl'
import MetaAnnotationImpl from '../meta/MetaAnnotationImpl'
import type {
    AnyDep,
    AnnotationResolver
} from '../../interfaces/nodeInterfaces'
import type {Plugin} from '../../interfaces/pluginInterfaces' // eslint-disable-line
import type {MetaDep} from '../meta/metaInterfaces'
import type {
    SetterDep,
    SetterAnnotation
} from './setterInterfaces'

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
            meta
        );
        acc.begin(dep)
        const invoker = new InvokerImpl(target, newAcc.getDeps(annotation.deps, target, info.tags));
        dep.init(invoker)
        acc.end(dep)
    }

    finalize(dep: SetterDep, target: AnyDep): void {
        defaultFinalizer(dep, target)
    }
}
