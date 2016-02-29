/* @flow */

import ModelDepImpl from 'reactive-di/plugins/model/impl/ModelDepImpl'
import type {Cursor} from 'reactive-di/i/modelInterfaces'
import type {
    Cacheable,
    AnnotationResolver
} from 'reactive-di/i/nodeInterfaces'
import type {Plugin} from 'reactive-di/i/pluginInterfaces' // eslint-disable-line
import type {
    ModelDep,
    ModelAnnotation
} from 'reactive-di/i/plugins/modelInterfaces'

// implements Plugin
export default class ModelPlugin {
    kind: 'model' = 'model';

    create<V: Object>(annotation: ModelAnnotation<V>, acc: AnnotationResolver): void {
        const id: string = annotation.id = acc.createId(); // eslint-disable-line
        const cursor: Cursor<V> = acc.createCursor(annotation.statePath);

        const dep: ModelDep<V> = new ModelDepImpl(annotation, cursor);
        acc.addRelation(id)

        const {childs} = annotation
        acc.begin(dep)
        for (let i = 0, l = childs.length; i < l; i++) {
            acc.resolve(childs[i])
        }
        acc.end(dep)
    }

    finalize<Dep: Object>(dep: ModelDep, child: Dep|ModelDep): void {
        const {base} = dep
        switch (child.kind) {
            case 'model': {
                const {base: childBase, dataOwners: childOwners} = child
                dep.dataOwners.push(childBase)
                childOwners.push((base: Cacheable))
                childBase.relations.push(base.id)
                break
            }
            default:
                throw new TypeError('Unhandlered dep type: ' + child.kind)
        }
    }
}
